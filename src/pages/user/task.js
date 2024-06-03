import { ThreeDots } from "react-bootstrap-icons";
import { Button } from "react-bootstrap";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useOutletContext } from "react-router-dom";

function Task({ view, data, fake_id, globalUID, setGlobalUID }) {
    const user = useOutletContext();
    const uid = `task-id-${data.id}`;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: uid, data: { ...data, type: 'TASK' } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined
    };

    return <li className="d-flex"
        ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* Detect this is placeholder or not */}
        {fake_id != null && data.id === fake_id
            ? <></>
            : <div className="flex-grow-1 d-flex align-items-center p-2 bg-secondary rounded">
                <p className="m-0 flex-fill">{data.name}</p>
                {view.leader?.id === user.id
                    ? <Button size="sm" variant="secondary">
                        <ThreeDots size={20} />
                    </Button>
                    : <></>}
            </div>}
    </li>
}

export default Task;