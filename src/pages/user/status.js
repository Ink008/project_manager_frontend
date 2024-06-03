import { useEffect, useState } from "react";
import { Check, Pen, Plus, Trash, X } from "react-bootstrap-icons";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useOutletContext } from "react-router-dom";

import Task from "./task";

function Status({ view, data, globalUID, setGlobalUID, isDisabledTask }) {
    const user = useOutletContext();
    const tasks = data.tasks;
    const uid = `status-id-${data.id}`;
    const [name, setName] = useState('');
    const [isShowing, setIsShowing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: uid,
        data: { ...data, type: 'STATUS' }
    });

    const isEmpty = () => {
        return tasks.length === 0 || (tasks.length === 1 && tasks[0].id.toString().includes('fake'))
    }

    // This will generate a fake task as a placeholder for SortableContext
    // Because for some F*CKING REASON that SoftableContent can't drop item when it's have no item in it
    // Update: the fake id should be different for each status
    const fake_id = `fake-${data.id}`;
    useEffect(() => {
        if (tasks.length === 0) tasks.push({
            id: fake_id,
            status_id: data.id
        })

        if (tasks.length > 1) {
            var index = tasks.findIndex((task) => task.id === fake_id);
            if (index === -1) return;
            tasks.splice(index, 1);
        }
    }, [tasks.length, data, tasks, fake_id])

    // This will set state back to normal when globalUID change
    useEffect(() => {
        if (globalUID == null || globalUID.toString() !== uid.toString()) {
            setIsCreating(false);
            setIsEditing(false);
        }
    }, [uid, globalUID]);

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined,
        width: 350,
        height: 'fit-content'
    };

    return <div className="border rounded border-light bg-dark m-2 d-flex flex-column"
        ref={setNodeRef} style={style} {...attributes} {...listeners} >
        {/* Title */}
        <div className="p-2">
            {!isEditing
                ? <div className="d-flex justify-content-between align-items-center">
                    <p className="h5 m-0">{data.name}</p>
                    {view.leader?.id === user.id
                        ? <ButtonGroup size="sm">
                            <Button variant="dark" type="button" onClick={() => {
                                setName(data.name)
                                setIsEditing(true);
                                setIsCreating(false);
                                setGlobalUID(uid);
                            }}>
                                <Pen size={20} />
                            </Button>
                            <Button variant="dark" onClick={() => setIsShowing(true)}>
                                <Trash size={20} />
                            </Button>
                        </ButtonGroup>
                        : <></>}
                </div>
                : <form id={`edit-status-${data.id}`}
                    className="d-flex justify-content-between align-items-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log('editing');
                    }}>
                    <input
                        autoFocus
                        className="h5 m-0"
                        data-bs-theme="dark"
                        value={name}
                        onChange={(e) => setName(e.target.value)} 
                    />
                    <ButtonGroup size="sm">
                        <Button variant="dark" type="submit" form={`edit-status-${data.id}`}>
                            <Check size={20} />
                        </Button>
                        <Button variant="dark" onClick={() => {
                            setIsEditing(false);
                            setGlobalUID(null);
                        }}>
                            <X size={20} />
                        </Button>
                    </ButtonGroup>
                </form>}
        </div>
        <hr className="m-0" />
        <ul className={`m-0 ${isEmpty() ? 'p-0' : 'p-2'}`}
            style={{
                display: 'grid',
                gridGap: '0.5rem',
                listStyle: 'none'
            }}>
            <SortableContext
                disabled={isDisabledTask || view.leader?.id !== user.id}
                items={tasks.map((task) => `task-id-${task.id}`)}
                strategy={verticalListSortingStrategy}
            >
                {tasks.map((task) => <Task
                    key={task.id}
                    data={task}
                    fake_id={fake_id}
                    view={view}
                    globalUID={globalUID}
                    setGlobalUID={setGlobalUID}
                />)}
            </SortableContext>
        </ul>
        {view.leader?.id === user.id && !isCreating
            ? <Button
                className={`text-light mx-2 ${isEmpty() ? 'my-2' : 'mb-2'}`}
                variant="outline-secondary"
                onClick={() => {
                    setIsCreating(true);
                    setIsEditing(false);
                    setGlobalUID(uid);
                }}
            >
                <Plus size={34} />
            </Button>
            : <></>}
        {isCreating
            ? <form id={`create-task`}
                className={`bg-secondary d-flex align-items-center rounded p-2 mx-2 ${isEmpty() ? 'my-2' : 'mb-2'}`}
                onSubmit={(e) => {
                    e.preventDefault();
                    console.log('creating');
                }}>
                <input
                    autoFocus
                    className="m-0 flex-fill"
                    data-bs-theme="dark"
                />
                <ButtonGroup size="sm">
                    <Button variant="secondary" type="submit" form={`create-task`}>
                        <Check size={20} />
                    </Button>
                    <Button variant="secondary" onClick={() => {
                        setIsCreating(false);
                        setGlobalUID(null);
                    }}>
                        <X size={20} />
                    </Button>
                </ButtonGroup>
        </form>
        : <></>}

        <DeleteDialog
            show={isShowing}
            onHide={() => setIsShowing(false)}
            onSubmit={() => {
                setIsShowing(false);
                console.log('deleting');
            }} />
    </div>;
}

function DeleteDialog({ show, onHide, onSubmit }) {
    return <Modal data-bs-theme="dark" className="text-light"
        show={show} onHide={onHide}>
        <Modal.Header>
            <Modal.Title className="text-danger">Delete Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you wanna delete this status?</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => onHide(false)}>
                Close
            </Button>
            <Button variant="outline-danger" onClick={onSubmit}>
                Delete
            </Button>
        </Modal.Footer>
    </Modal>
}

export default Status;