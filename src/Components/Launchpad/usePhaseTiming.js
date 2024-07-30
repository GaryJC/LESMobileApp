import { useMemo } from "react";
import moment from "moment";
import useGetTargetPhase from "./useGetTargetPhase";
import { getCurrentPhaseIndex, formatTimeLeft } from "./handler";

export default function usePhaseTiming(phase, activityPhaseIndex) {
  const currentPhaseIndex = getCurrentPhaseIndex(phase);

  // Call useGetTargetPhase unconditionally
  const openTimeTarget = useGetTargetPhase(phase[activityPhaseIndex].openTime);
  const endTimeTarget = useGetTargetPhase(phase[activityPhaseIndex].endTime);
  const nextOpenTimeTarget = useGetTargetPhase(
    phase[activityPhaseIndex + 1]?.openTime
  );

  const { timeLeft, typoTime, color, status } = useMemo(() => {
    let timeLeft;
    let typoTime = "";
    let color = "";
    let status = "";

    const currentTime = moment().valueOf();
    const openTime = moment(phase[activityPhaseIndex].openTime).valueOf();
    const endTime =
      phase[activityPhaseIndex].endTime > 0
        ? moment(phase[activityPhaseIndex].endTime).valueOf()
        : null;

    if (currentTime < openTime) {
      color = "bg-yellow-400";
      status = "Upcoming";
      timeLeft = openTimeTarget;
      typoTime = "Starts in: " + formatTimeLeft(timeLeft);
    } else if (endTime && currentTime < endTime) {
      color = "bg-green-400";
      status = "Ongoing";
      timeLeft = endTimeTarget;
      typoTime = "Ends in: " + formatTimeLeft(timeLeft);
    } else if (endTime && currentTime > endTime) {
      color = "bg-red-400";
      status = "Ended";
      timeLeft = null;
      typoTime = "Ended on: " + moment(endTime).format("LL");
    } else if (!endTime && currentPhaseIndex === activityPhaseIndex) {
      color = "bg-green-400";
      status = "Ongoing";
      timeLeft = nextOpenTimeTarget;
      typoTime = "Ends in: " + formatTimeLeft(timeLeft);
    } else {
      color = "bg-red-400";
      status = "Ended";
      timeLeft = null;
      typoTime = "Ended";
    }

    return { timeLeft, typoTime, color, status };
  }, [
    currentPhaseIndex,
    openTimeTarget,
    endTimeTarget,
    nextOpenTimeTarget,
    phase,
    activityPhaseIndex,
  ]);

  const isActionDisabled = useMemo(() => {
    return status !== "Ongoing";
  }, [status]);

  return {
    isActionDisabled,
    typoTime,
    color,
    status,
  };
}
