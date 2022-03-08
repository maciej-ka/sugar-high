import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>sugar high</title>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:image" content="https://repository-images.githubusercontent.com/453236442/9416c941-9c40-4dbe-a73e-0e0d21993802" />
        <meta property="og:title" content="Sugar High" />
        <meta property="og:description" content="Super lightweight JSX syntax highlighter, around 1KB after minified and gzipped" />
        <meta name="twitter:image:src" content="https://repository-images.githubusercontent.com/453236442/9416c941-9c40-4dbe-a73e-0e0d21993802" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}