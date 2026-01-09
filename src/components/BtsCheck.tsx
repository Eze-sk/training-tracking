import CheckIcon from "../assets/Check";

export type StatusBts = "completed" | "activated" | "deactivated"

export interface Props {
  event: () => void;
  statusBts: StatusBts
}

export default function BtsCheck({ event, statusBts }: Props) {
  const disabled = statusBts === "deactivated"
  const baseStyle = "border transition text-xl font-semibold py-3 px-6 rounded mt-10 min-w-44 flex items-center justify-center gap-2"

  const statusStyle: Record<StatusBts, string> = {
    completed: "border-acc-secondary bg-layer-top hover:bg-acc-primary active:bg-layer-mid group hover:text-txt-primary cursor-pointer",
    activated: "bg-layer-top cursor-pointer hover:bg-acc-secondary active:bg-acc-primary",
    deactivated: "bg-layer-mid cursor-not-allowed text-layer-top border-layer-top"
  }

  return (
    <button
      className={`${baseStyle} ${statusStyle[statusBts]}`}
      onClick={event}
      disabled={disabled}
    >
      {statusBts === "activated" && "Check Day"}
      {statusBts === "deactivated" && "No routine today."}
      {statusBts === "completed" && (
        <>
          <span>Day completed</span>
          <CheckIcon className="text-acc-primary group-hover:text-txt-primary" />
        </>
      )}
    </button>
  )
}