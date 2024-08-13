import { Button } from "react-bootstrap";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scrollbar } from "react-scrollbars-custom";

import { DangerToast } from "../../component/toast";
import { FetchGetAPI } from "../../config/config";

function TaskNotifications() {
    const user_id = JSON.parse(sessionStorage.getItem("user_id"));
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [tasks, setTasks] = useState([]);

    const getViewId = async (taskId) => {
        try {
            const data = await FetchGetAPI(`/task/${taskId}/view`);
            return data.id;
        } catch (error) {
            DangerToast("Fetch viewId failed!");
            return null;
        }
    }

    const getNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/task/notifications?user_id=${user_id}`);
            if (!data) throw new Error('There is something wrong with backend!');

            data = data.filter((task) => {
                let due_date = new Date(task.due_date);
                let current_time = new Date();

                return task.completed_date != null 
                || current_time > due_date
                || Math.abs(current_time.getDate() - due_date.getDate() + 1) <= 3
            });

            console.log(data);
            setTasks(data);
        } catch (error) {
            DangerToast("Get Notifications Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [user_id]);

    useEffect(() => {
        getNotifications();
    }, [getNotifications]);

    const date_diff = (reminder_date, due_date, completed_date = null) => {
        if(due_date == null) return '';

        if(completed_date != null) return 'COMPLETE';

        let startDate = reminder_date != null ? new Date(reminder_date) : new Date();
        let endDate = new Date(due_date);

        if (startDate > endDate) return 'OVER DUE';

        let timeDifference = endDate - startDate;

        let seconds = timeDifference / 1000;
        let minutes = seconds / 60;
        let hours = minutes / 60;
        let days = hours / 24;
        let months = days / 30.436875;
        let years = months / 12;
    
        if (years >= 1) {
            return `${Math.floor(years)} years remains`;
        } else if (months >= 1) {
            return `${Math.floor(months)} months remains`;
        } else if (days >= 1) {
            return `${Math.floor(days)} days remains`;
        } else if (hours >= 1) {
            return `${Math.floor(hours)} hours remains`;
        } else if (minutes >= 1) {
            return `${Math.floor(minutes)} minutes remains`;
        } else {
            return `Less than 1 minute`;
        }
    }

    const colorHandler = (reminder_date, due_date, completed_date = null) => {
        let currentDate = new Date();
        let minDate = new Date(-8640000000000000);
        let maxDate = new Date(8640000000000000);
        let startDate = reminder_date != null ? new Date(reminder_date) : minDate;
        let endDate = due_date != null ? new Date(due_date) : maxDate;
        let completedDate = completed_date != null ? new Date(completed_date) : null;
        
        if(completed_date) return completedDate < endDate ? 'success' : 'danger';
        if(!reminder_date && !due_date) return 'secondary';

        if (currentDate < startDate) return 'secondary';
        else if (currentDate < endDate) {
            let daysDifference = (endDate - currentDate) / (1000 * 60 * 60 * 24);
            return Math.floor(daysDifference) > 1 ? 'primary' : 'warning';
        } else return 'danger';
    }

    return isLoading
        ? <div className="text-center my-2">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
        : tasks.length === 0
        ? <div className="text-center my-2 h5">There is nothing here at this time</div>
            : <Scrollbar style={{height: 'calc(100vh - 180px)'}}>
                {tasks.map((task) => {
                    var task_color = colorHandler(task.reminder_date, task.due_date, task.completed_date);
                    var task_date_diff = date_diff(task.reminder_date, task.due_date, task.completed_date);

                    return <div key={task.id}>
                        <Button 
                            variant="dark" 
                            className={`w-100 text-start text-${task_color}`}
                            onClick={async () => {
                                const viewId = await getViewId(task.id);
                                if (viewId) {
                                    navigate(`/task/${task.id}`,  { state: { viewId: viewId, userId: user_id } });
                                }
                            }}
                        >
                            <b>{`${task_date_diff}: "${task.name}"`}</b>
                        </Button>
                    </div>
                })}
            </Scrollbar>;
}

export default TaskNotifications;