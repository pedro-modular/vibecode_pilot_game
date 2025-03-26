import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import game without SSR to avoid hydration issues
const Game = dynamic(() => import('../components/Game'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Space Combat</title>
      </Head>
      <main>
        <Game />
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #000;
          }

          main {
            width: 100%;
            height: 100vh;
          }
        `}</style>
      </main>
    </>
  );
} 