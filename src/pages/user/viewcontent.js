import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Scrollbar } from "react-scrollbars-custom";
import { 
    DndContext, 
    closestCorners, 
    DragOverlay, 
    defaultDropAnimationSideEffects,
    MouseSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

import Status from "./status";
import Task from "./task";
import Skeleton from "react-loading-skeleton";
import { DangerToast } from "../../component/toast";
import { FetchGetAPI } from "../../config/config";
import { Button, ButtonGroup } from "react-bootstrap";
import { Check, Plus, X } from "react-bootstrap-icons";

function ViewContent() {
    const user = useOutletContext();
    const { id } = useParams();
    const [content, setContent] = useState([]);
    const [view, setView] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [uid, setUID] = useState(null);
    const navigate = useNavigate();
    // Variable state for dnd kit
    const [isDisabledStatus, setIsDisabledStatus] = useState(false);
    const [isDisabledTask, setIsDisabledTask] = useState(false);
    // Variable for sensor
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
          distance: 10,
        },
      });
    const sensors = useSensors(mouseSensor);
    // Variable state for overlay
    const [overlayActive, setOverlayActive] = useState(null);

    const findStatusByTaskID = (id) => content.find((status) =>
        status.tasks.map((task) => task.id.toString()).includes(id.toString()));

    const findTaskIndexByID = (taskArr, id) =>
        taskArr.findIndex((task) => task.id.toString() === id.toString());

    const fetchContent = useCallback(async () => {
        try {
            var data = await FetchGetAPI(`/view/${id}/content`);
            setContent(data);
            data = await FetchGetAPI(`/view/id=${encodeURIComponent(id)}`);
            setView(data);
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
            setContent([]);
        }
    }, [id]);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            await fetchContent();
        } catch (error) {
            DangerToast("Get Data Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [fetchContent]);

    useEffect(() => {
        if (user.is_manager) {
            navigate('/home');
        }
        refresh();
    }, [refresh, navigate, user.is_manager]);

    useEffect(() => {
        if (uid != null) {
            setIsCreating(false);
        }
    }, [uid]);

    return <Scrollbar style={{ minHeight: 'calc(100vh - 68px)' }}>
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event) => {
                const { active } = event;
                const active_current = active.data.current;
                setOverlayActive(active_current);

                if (active_current.type === 'STATUS') {
                    setIsDisabledStatus(false);
                    setIsDisabledTask(true);
                } else if (active_current.type === 'TASK') {
                    setIsDisabledTask(false);
                    setIsDisabledStatus(true);
                }
            }}

            onDragOver={(event) => {
                const { active, over } = event;

                if (!active?.data?.current || !over?.data?.current || !over) return;
                if (active?.id.toString() === over?.toString()) return;

                const active_current = active.data.current;
                const over_current = over.data.current;

                if (active_current.type === 'TASK' && over_current.type === 'TASK') {
                    const old_tasks = findStatusByTaskID(active_current.id.toString()).tasks;
                    const new_tasks = findStatusByTaskID(over_current.id.toString()).tasks;
                    let old_index = findTaskIndexByID(old_tasks, active_current.id.toString());
                    let new_index = findTaskIndexByID(new_tasks, over_current.id.toString());

                    const isBelowOverItem =
                        active.rect.current.translated &&
                        active.rect.current.translated.top >
                        over.rect.top + over.rect.height;
                    const modifier = isBelowOverItem ? 1 : 0;

                    new_index = new_index >= 0 ? new_index + modifier : new_tasks.length + 1;

                    old_tasks[old_index].status_id = over_current.status_id;
                    old_tasks[old_index].position = new_index;

                    let [task] = old_tasks.splice(old_index, 1);
                    new_tasks.splice(new_index, 0, task);
                }
            }}

            onDragEnd={(event) => {
                const { active, over } = event;
                console.log('active: ', active);
                console.log('over: ', over);

                if (!active?.data?.current || !over?.data?.current || !over) return;
                if (active?.id.toString() === over?.toString()) return;

                const active_current = active.data.current;
                const over_current = over.data.current;

                if (active_current.type === 'STATUS' && over_current.type === 'STATUS') {
                    const old_index = active_current.sortable.index;
                    const new_index = over_current.sortable.index;
                    setContent(arrayMove(content, old_index, new_index));
                }

                if (active_current.type === 'TASK' && over_current.type === 'TASK') {
                    console.log(overlayActive);
                }

                setIsDisabledStatus(false);
                setIsDisabledTask(false);
                setOverlayActive(null);
            }}
        >
            <div className="m-2"
                style={{
                    display: 'inline-grid',
                    gridAutoFlow: 'column'
                }}>
                <SortableContext
                    disabled={isDisabledStatus || view.leader?.id !== user.id}
                    items={content.map((status) => `status-id-${status.id}`)}
                    strategy={horizontalListSortingStrategy}
                >
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, index) =>
                            <Skeleton key={index} className="m-2" width={350} height={350} />)
                        : <>
                            {content.map((status) => <Status
                                key={status.id}
                                view={view}
                                data={status}
                                globalUID={uid}
                                setGlobalUID={setUID}
                                isDisabledTask={isDisabledTask}
                            />)}
                        </>}
                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: {
                                    opacity: '0.5',
                                },
                            },
                        }),
                    }}>
                        {overlayActive && overlayActive.type === 'STATUS' && <Status
                            data={overlayActive}
                            view={view}
                            isDisabledTask={isDisabledTask} />}
                        {overlayActive && overlayActive.type === 'TASK' && <Task
                            data={overlayActive}
                            view={view} />}
                    </DragOverlay>
                </SortableContext>
                {!isLoading && view.leader?.id === user.id && !isCreating
                    ? <Button
                        className="m-2 text-light bg-dark border-light"
                        style={{
                            width: 350,
                            height: 'fit-content'
                        }}
                        onClick={() => {
                            setIsCreating(true);
                            setUID(null);
                        }}
                    >
                        <Plus size={34} />
                    </Button> : <></>}
                {isCreating
                    ? <div 
                        className="border rounded border-light bg-dark m-2"
                        style={{
                            width: 350,
                            height: 'fit-content'
                        }}
                    >
                        <form id="create-status"
                            className="d-flex justify-content-between align-items-center p-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                console.log('creating status');
                            }}
                        >
                            <input
                                autoFocus
                                className="h5 m-0"
                                data-bs-theme="dark"
                            />
                            <ButtonGroup size="sm">
                                <Button variant="dark" type="submit" form="create-status">
                                    <Check size={20} />
                                </Button>
                                <Button variant="dark" onClick={() => {
                                    setIsCreating(false);
                                }}>
                                    <X size={20} />
                                </Button>
                            </ButtonGroup>
                        </form>
                    </div>
                    : <></>}
            </div>
        </DndContext>
    </Scrollbar>;
}

export default ViewContent;