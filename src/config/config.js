const Server_URL = "http://localhost:8080";
const WebSocket_URL = "ws://localhost:8080";

// eslint-disable-next-line
function FetchPostAPI(endpoint, body) {
    return new Promise((resolve, reject) => {
        fetch(Server_URL + endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(res => res.json())
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
}

// eslint-disable-next-line
function FetchGetAPI(endpoint) {
    return new Promise((resolve, reject) => {
        fetch(Server_URL + endpoint)
        .then(res => res.json())
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
}

export { FetchPostAPI, FetchGetAPI, WebSocket_URL };
export default Server_URL;