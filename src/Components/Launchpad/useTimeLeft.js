import { useState, useEffect } from "react";
import moment from "moment";

const useTimeLeft = (targetTime) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!targetTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    let intervalId;

    const updateTimeLeft = () => {
      const now = moment();
      const targetMoment = moment(targetTime);

      const duration = moment.duration(targetMoment.diff(now));

      if (duration.asMilliseconds() <= 0) {
        clearInterval(intervalId);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(duration.asDays()),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
      });
    };

    updateTimeLeft(); // Initial update
    intervalId = setInterval(updateTimeLeft, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up on unmount or targetTime change
  }, [targetTime]);

  return timeLeft;
};

export default useTimeLeft;
