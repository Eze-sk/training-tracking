import Database from '@tauri-apps/plugin-sql'
import {
  TrainingDay,
  TrainingLogs,
  type UserMetadataType,
} from '../types/UserMetadata'
import { format } from 'date-fns'

interface CountResult {
  count: number
}

class UserTrainingService {
  private db: Database | null = null
  private isProcessing = false

  async getDB() {
    if (!this.db) {
      this.db = await Database.load('sqlite:training_database.db')
      await this.db.execute('PRAGMA journal_mode = WAL;')
      await this.db.execute('PRAGMA busy_timeout = 5000;')
    }

    return this.db
  }

  private async lock() {
    while (this.isProcessing) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    this.isProcessing = true
  }

  private unlock() {
    this.isProcessing = false
  }

  async init() {
    await this.lock();

    try {
      const db = await this.getDB()

      const result = await db.execute(`
        INSERT OR IGNORE INTO user_metadata (id, max_streak, current_streak) 
        VALUES (1, 0, 0)
      `)

      return result
    } catch (err) {
      throw new Error(`Error <init>: ${err}`)
    } finally {
      this.unlock();
    }
  }

  async getMetadata() {
    try {
      const db = await this.getDB()

      const result = (await db.select(
        'SELECT * FROM user_metadata WHERE id = 1',
      )) as UserMetadataType[]

      return result[0]
    } catch (err) {
      throw new Error(`Error <getMetadata>: ${err}`)
    }
  }

  async hasConfiguredRoutine() {
    try {
      const db = await this.getDB()

      const result = await db.select<CountResult[]>(
        'SELECT COUNT(*) as count FROM target_days',
      )

      return (result[0]?.count ?? 0) > 0
    } catch (err) {
      throw new Error(`Error <hasConfiguredRoutine>: ${err}`)
    }
  }

  async saveTargetDays({ days }: { days: number[] }) {
    try {
      const db = await this.getDB()

      await db.execute('DELETE FROM target_days WHERE user_id = 1')

      for (const day of days) {
        await db.execute(
          'INSERT INTO target_days (user_id, day_of_week) VALUES (?, ?)',
          [1, day],
        )
      }

      return {
        message: 'Routine saved correctly',
      }
    } catch (err) {
      throw new Error(`Error <saveTargetDays>: ${err}`)
    }
  }

  async getTrainingDay(): Promise<TrainingDay[]> {
    try {
      const db = await this.getDB()

      const result = await db.select<TrainingDay[]>(`
        SELECT 
          td.day_of_week as day,
          COALESCE(tl.status, 'pending') as status
        FROM target_days td
        LEFT JOIN training_logs tl ON 
          tl.user_id = td.user_id AND 
          CAST(strftime('%w', tl.date_recorded) AS INTEGER) = td.day_of_week AND
          tl.date_recorded >= date('now', 'weekday 0', '-7 days')
        WHERE td.user_id = 1
        GROUP BY td.day_of_week;
      `)

      return result.map((row) => ({
        day: Number(row.day),
        status: row.status,
      }))
    } catch (err) {
      throw new Error(`Error <getTrainingDay>: ${err}`)
    }
  }

  async updateTrainingLogs({
    status,
    date,
  }: {
    status: 'completed' | 'failed' | 'pending'
    date?: string
  }) {
    try {
      const db = await this.getDB()
      let dateSave

      if (date) {
        dateSave = date
      } else {
        dateSave = format(new Date(), 'yyyy-MM-dd')
      }

      if (status === 'pending') {
        await db.execute(
          'DELETE FROM training_logs WHERE user_id = 1 AND date_recorded = ?',
          [dateSave],
        )
      } else {
        await db.execute(
          `
          INSERT OR REPLACE INTO training_logs (user_id, date_recorded, status)
          VALUES (?, ?, ?)
        `,
          [1, dateSave, status],
        )
      }

      return { success: true }
    } catch (err) {
      throw new Error(`Error <updateTrainingLogss>: ${err}`)
    }
  }

  async getTrainigLog() {
    try {
      const db = await this.getDB()

      const result = (await db.select(
        'SELECT * FROM training_logs',
      )) as TrainingLogs[]

      return result
    } catch (err) {
      throw new Error(`Error <getTrainigLog>: ${err}`)
    }
  }

  async resetAllData() {
    await this.lock()
    let transactionStarted = false;

    try {
      const db = await this.getDB()
      await db.execute('BEGIN TRANSACTION;')
      await db.execute('DELETE FROM target_days;')
      await db.execute('DELETE FROM training_logs;')

      transactionStarted = true

      await db.execute(
        "DELETE FROM sqlite_sequence WHERE name IN ('target_days', 'training_logs');",
      )

      await db.execute(`
        INSERT OR REPLACE INTO user_metadata (id, max_streak, current_streak) 
        VALUES (1, 0, 0);
      `)

      await db.execute('COMMIT;')

      return {
        success: true,
        message: 'All data has been successfully reset.',
      }
    } catch (err) {
      if (transactionStarted) {
        const db = await this.getDB();
        try {
          await db.execute('ROLLBACK;');
        } catch (e) { console.error(e) }
      }

      throw new Error(`Error <resetAllData>: ${err}`);
    } finally {
      this.unlock()
    }
  }

  async updateRoutineStartDate() {
    try {
      const db = await this.getDB()

      const today = format(new Date(), 'yyyy-MM-dd')

      await db.execute(
        `
        UPDATE user_metadata 
        SET routine_start_date = ? 
        WHERE id = 1
      `,
        [today],
      )

      return { success: true }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  async updateStreak(delta: number) {
    try {
      const db = await this.getDB()

      await db.execute(
        `
        UPDATE user_metadata 
        SET current_streak = MAX(0, current_streak + ?)
        WHERE id = 1
      `,
        [delta],
      )

      await db.execute(`
        UPDATE user_metadata 
        SET max_streak = current_streak
        WHERE id = 1 AND current_streak > max_streak
      `)

      return { success: true }
    } catch (err) {
      throw new Error(`Error <resetAllData>: ${err}`)
    }
  }
}

export const userTrainingService = new UserTrainingService()
