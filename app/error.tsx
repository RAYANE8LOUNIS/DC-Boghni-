"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="not-found container"><p className="eyebrow">Un problème est survenu</p><h1>La page n’a pas pu se charger.</h1><p>Réessayez dans un instant.</p><button className="button button--dark" onClick={() => reset()}>Réessayer</button></div>; }
