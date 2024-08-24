import { ORDERSTATUS } from '@/constant/order';
import { Ban, CircleCheckBig, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function OrderTimer({ created_at, status }: { created_at: Date, status: string }) {
    const [timeLeft, setTimeLeft] = useState(0);

    const returnIcon = () => {

        switch (status) {
            case ORDERSTATUS['processing']:
                return <Clock size={20} />
            case ORDERSTATUS['invalid']:
                return <Ban size={20} />
            case ORDERSTATUS['completed']:
                return <CircleCheckBig size={20} />
            default:
                return <Clock size={20} />
        }

    }

    useEffect(() => {
        const targetTime = new Date(created_at).getTime() + 60 * 60 * 1000; // 1 hour after created_at
        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const timeRemaining = targetTime - now;

            if (timeRemaining <= 0) {
                setTimeLeft(0);
                clearInterval(intervalId); // Stop the timer when time is up
            } else {
                setTimeLeft(timeRemaining);
            }
        }, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [created_at]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className='text-sm text-foreground flex items-center gap-1.5'>{timeLeft > 0 ? formatTime(timeLeft) : status === 'completed' ? "Completed" : "Invalid"} {returnIcon()}</div>
    );
}

export default OrderTimer;
