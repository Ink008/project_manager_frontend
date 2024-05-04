import { Search } from "react-bootstrap-icons";
import { Button, Form } from "react-bootstrap";
import { useState } from "react";

function SearchBar({onSearch}) {
    const [value, setValue] = useState('');

    return <Form onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
    }}>
        <div className="input-group d-flex align-items-center">
            <input style={{ marginRight: '-40px' }} className="form-control rounded-pill bg-dark text-light"
                type="search" value={value} onChange={(e) => setValue(e.target.value)}/>
            <span className="input-group-append">
                <Button variant="dark"
                    className="rounded-pill border-0 ml-n5 pb-2 d-flex align-items-center" type="submit">
                    <Search />
                </Button>
            </span>
        </div>
    </Form>
}

export default SearchBar;