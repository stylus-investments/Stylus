import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const Timer = ({ nextSnapshot }: { nextSnapshot: string }) => {
    const calculateTimeLeft = () => {
        const difference = new Date(nextSnapshot).getTime() - new Date().getTime();
        let timeLeft: { days: number; hours: number; minutes: number; seconds: number } = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Clear timeout if the component is unmounted or the next snapshot time is passed
        if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
            clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    });

    return (
        <div className='flex flex-col gap-3 w-1/2'>
            <div className='text-muted-foreground flex items-center gap-3'>
                <FontAwesomeIcon icon={faClock} width={18} height={18} />
                Timer
            </div>
            <h1 className='font-black text-xl'>
                {timeLeft.days} days {timeLeft.hours} hours {timeLeft.minutes} minutes {timeLeft.seconds} seconds
            </h1>
        </div>
    );
};

export default Timer