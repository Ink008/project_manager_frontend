import { useOutletContext } from "react-router-dom";
import WorkspaceManager from "./workspacemanager";
import ViewManager from "./viewmanager";

function Home() {
    const user = useOutletContext();
    return user.is_manager ? <WorkspaceManager/> : <ViewManager/>
}

export default Home;