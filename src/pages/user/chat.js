import React, { useState, useEffect, useRef } from "react";
import { Button, Form, InputGroup, Dropdown } from "react-bootstrap";
import { FetchGetAPI, FetchPostAPI} from "../../config/config";
import { DangerToast } from "../../component/toast";

function ChatMess({ viewId, userId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [messageToDelete, setMessageToDelete] = useState(null);
    const endOfMessagesRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const data = await FetchGetAPI(`/comment?view_id=${viewId}`);
            if (!data) throw new Error("Failed to fetch messages");
            setMessages(data);
        } catch (error) {
            DangerToast("Error fetching messages", error.message);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const result = await FetchPostAPI("/comment/add", {
                user_id: userId,
                view_id: viewId,
                content: newMessage.trim(),
            });

            if (result.success) {
                setNewMessage("");
                fetchMessages();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            DangerToast("Error sending message", error.message);
        }
    };

    const deleteMessage = async () => {
        try {
            const result = await FetchGetAPI(`/comment/delete?id=${messageToDelete}&user_id=${userId}`);
            
            if (result.success) {
                fetchMessages();
                setMessageToDelete(null);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            DangerToast("Error deleting message", error.message);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewId]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div>
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#343a40',
                color: '#fff',
                marginBottom: '10px',
                position: 'relative'
            }}>
                {messages.map((message) => (
                    <div key={message.id} style={{ 
                        marginBottom: '10px', 
                        position: 'relative',                       
                        borderRadius: '5px'
                        }}>
                        <b>{message.user_id === userId ? "Me" : message.lastname}:</b> {message.content}
                        {message.user_id === userId && (
                            <Dropdown
                                align="end"
                                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                            >
                                <Dropdown.Toggle variant="link" id="dropdown-custom-components">
                                    <span style={{ fontSize: '18px' }}>⋮</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        as="button"
                                        onClick={() => setMessageToDelete(message.id)}
                                    >
                                        Delete
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </div>
                ))}
                <div ref={endOfMessagesRef} />
            </div>
            <InputGroup className="mt-3">
                <Form.Control
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ backgroundColor: '#6c757d', color: '#fff' }}
                />
                <Button variant="primary" onClick={sendMessage}>
                    Send
                </Button>
            </InputGroup>

            {messageToDelete && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#6c757d',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                    zIndex: 1000
                }}>
                    <p>Are you sure you want to delete this message?</p>
                    <Button
                        variant="danger"
                        onClick={deleteMessage}
                        style={{ marginRight: '10px' }}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setMessageToDelete(null)}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ChatMess;
