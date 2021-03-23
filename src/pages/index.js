import Head from 'next/head';
import styles from '../styles/Home.module.css';

import HelloWorld from './HelloWorld';
import Anchors from "./Anchors";
import AutoLayout from "./AutoLayout";
import Animation from "./Animation";
import Boundary from "./Boundary";
import Clipboard from "./Clipboard";

export default function Home() {
  return (
    <>
      <HelloWorld />
      <Anchors />
      <AutoLayout />
      <Animation />
      <Boundary />
      <Clipboard />
    </>
  );
}
