import { createCookieSessionStorage, redirect, type Session } from "react-router";

type SessionData = {
    userId: string;
};

type SessionFlashData = {
    error: string;
    success: string;
};

const sessionSecret = process.env.SESSION_SECRET || 's3cret1';

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData, SessionFlashData>(
        {
            cookie: {
                name: "__session",
                secrets: [sessionSecret]
            },
        },
    );

const back = async (session: Session<SessionData, SessionFlashData>, path: string, errorMessage?: string) => {
    errorMessage && session.flash('error', errorMessage)
    return redirect(path, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    })
};

const pass = async (session: Session<SessionData, SessionFlashData>, path: string, successMessage?: string) => {
    successMessage && session.flash('success', successMessage)
    return redirect(path, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    })
};

const logout = async (request: Request) => {
    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(await getSession(request.headers.get("Cookie"))),
        },
    });
}

export { getSession, commitSession, destroySession, back, pass, logout };