import { useContext, useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
    const { setUserInfo, userInfo } = useContext(UserContext)
    const username = userInfo?.username
    useEffect(() => {
        fetch('http://localhost:4000/profile', {
            credentials: 'include'
        }).then(res => {
            res.json().then(userInfo => {
                setUserInfo(userInfo)
            })
        })
    }, [])
    function logout() {
        fetch('http://localhost:4000/logout', {
            method: 'POST',
            credentials: 'include'
        })
        setUserInfo(null)
    }
    return (
        <header>
            <Link to="/" className="logo">MyBlog</Link>
            <nav>
                {username && (
                    <>
                        <Link to='/create'>Create new post</Link>
                        <a onClick={logout}>Logout</a>
                    </>
                )}
                {!username && (
                    <>
                        <Link to="/login">login</Link>
                        <Link to="/register">register</Link>
                    </>
                )}
            </nav>
        </header>
    )
}