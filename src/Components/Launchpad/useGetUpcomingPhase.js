import { useState, useEffect } from "react";
import moment from "moment";
import useTimeLeft from "./useTimeLeft";

const useGetUpcomingPhase = (phases) => {
  const [upcomingPhase, setUpcomingPhase] = useState(null);
  const [targetTime, setTargetTime] = useState(null);
  const timeLeft = useTimeLeft(targetTime);

  useEffect(() => {
    let intervalId;

    const findNextPhase = () => {
      const currentTime = moment().valueOf();
      const nextPhase = phases.find((p) => p.openTime > currentTime);
      setUpcomingPhase(nextPhase);

      if (nextPhase) {
        setTargetTime(nextPhase.openTime);
      } else {
        setTargetTime(null);
        clearInterval(intervalId); // Clear the interval if no upcoming phase is found
      }
    };

    findNextPhase(); // Initial execution

    intervalId = setInterval(findNextPhase, 1000); // Check for the next phase every second

    return () => clearInterval(intervalId); // Clean up on unmount or phases array change
  }, [phases]);

  return { upcomingPhase, timeLeft };
};

export default useGetUpcomingPhase;
