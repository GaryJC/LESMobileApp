import { useState, useEffect } from "react";
import moment from "moment";

const useGetTargetPhase = (time) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (time) {
      const interval = setInterval(() => {
        const now = moment().valueOf();
        const duration = moment.duration(moment(time).diff(now));

        setTimeLeft({
          days: duration.days(),
          hours: duration.hours(),
          minutes: duration.minutes(),
          seconds: duration.seconds(),
        });

        // Clear interval if the next phase starts
        if (duration.asMilliseconds() <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [time]);

  return timeLeft;
};

export default useGetTargetPhase;
