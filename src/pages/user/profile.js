import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DangerToast } from "../../component/toast";
import { FetchGetAPI } from "../../config/config";
import Skeleton from "react-loading-skeleton";
import Jdenticon from 'react-jdenticon';
// import { Button } from "react-bootstrap";

function Profile() {
    // const user_id = useOutletContext().id;
    const { id } = useParams();
    const icon_size = 120;
    const [isLoading, setIsLoading] = useState(true);
    const [profileUser, setProfileUser] = useState(null);

    const getUserInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            var data = await FetchGetAPI(`/user/id=${id}`);
            if (!data) throw new Error('There is something wrong with backend!');
            console.log(data);
            setProfileUser(data);
        } catch (error) {
            DangerToast("Get User Profile Failed!", error.message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        getUserInfo();
    }, [getUserInfo]);

    return <div className="container mt-5">
        <div className="row">
            <div className="d-flex col-md-6 mb-2">
                {isLoading 
                ? <Skeleton containerClassName='d-flex align-items-center' height={icon_size} width={icon_size} /> 
                : <Jdenticon size={icon_size.toString()} value={profileUser.id.toString()} />}
                <div className="ms-4">
                    <h2 className="mb-4 me-2">
                        {isLoading ? <Skeleton width={200}/> : profileUser.username}
                    </h2>
                    {/* {profileUser && profileUser.id === user_id
                    ? <Button disabled={isLoading} >Edit profile</Button>
                    : <></>} */}
                </div>
            </div>
            <div className="col-md-6">
                <h2>Profile</h2>
                <hr />
                <h5>Full Name</h5>
                <p className="w-100">
                    {isLoading ? <Skeleton /> : profileUser.firstname + " " + profileUser.lastname}
                </p>
            </div>
        </div>
    </div>
}

export default Profile;