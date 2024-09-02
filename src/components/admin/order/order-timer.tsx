import { Skeleton } from '@/components/ui/skeleton';
import { ORDERSTATUS } from '@/constant/order';
import { Ban, CircleCheckBig, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function OrderTimer({ created_at, status }: { created_at: Date, status: string }) {
    const [timeLeft, setTimeLeft] = useState(0);

    const returnIcon = () => {
        switch (status) {
            case ORDERSTATUS['processing']:
                return <Clock size={20} />;
            case ORDERSTATUS['invalid']:
                return <Ban size={20} />;
            case ORDERSTATUS['completed']:
                return <CircleCheckBig size={20} />;
            default:
                return <Clock size={20} />;
        }
    };

    useEffect(() => {
        if (status !== ORDERSTATUS['processing']) {
            // No need to start timer if not processing
            setTimeLeft(0);
            return;
        }

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
    }, [created_at, status]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className={`text-sm text-foreground flex items-center gap-1.5 absolute -bottom-6 rounded-lg shadow 
        ${status === ORDERSTATUS["processing"] ? "shadow-foreground" : status === ORDERSTATUS["completed"] ? "shadow-primary" : "shadow-destructive"} 
        px-5 bg-secondary py-2 left-1/2 translate-x-[-50%]`}>
            {status === ORDERSTATUS['processing'] ? (
                <>
                    {timeLeft > 0 ? formatTime(timeLeft) : <Skeleton className='w-20 h-8' />} {returnIcon()}
                </>
            ) : status === ORDERSTATUS['completed'] ? (
                <>
                    Completed {returnIcon()}
                </>
            ) : (
                <>
                    Invalid {returnIcon()}
                </>
            )}
        </div>
    );
}

export default OrderTimer;
