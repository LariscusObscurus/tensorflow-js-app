import React from "react";
import "./ImageList.css";

export default function (props: any) {
    return (
        <ul className="image-list">
            {props.pics.map(({data}: any) =>
                <li className="image-list__item">
                    <img className="image-list__image" src={data}/>
                </li>
            )}
        </ul>
    );
};
