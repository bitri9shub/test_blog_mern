import { useEffect, useState } from "react";
import Post from "../Post";

export default function Index() {
    const [posts, setPosts] = useState([])
    useEffect(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                setPosts(posts)
            })
        })
    }, [])
    return (
        <>
            {posts.length > 0 && posts.map(post => {
                return <Post key={post._id} {...post} />
            })}
        </>
    )
}