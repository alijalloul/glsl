"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import vertexShaderMain from "./shaders/vertexShaderMain.glsl";
import vertexShaderPars from "./shaders/vertexShaderPars.glsl";

const IcoSphere = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x060a14);

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const dirextionalLight = new THREE.DirectionalLight("#FFFFFF", 0.75);
    dirextionalLight.position.set(5, 5, 5);

    const ambientLight = new THREE.AmbientLight("#FFFFFF", 0.2);

    scene.add(dirextionalLight, ambientLight);

    const geometry = new THREE.IcosahedronGeometry(1, 100);
    const material = new THREE.MeshStandardMaterial({
      onBeforeCompile: (shader) => {
        material.userData.shader = shader;
        shader.uniforms.uTime = { value: 0 };

        const parseVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`;

        shader.vertexShader = shader.vertexShader.replace(
          parseVertexString,
          `${parseVertexString}\n${vertexShaderPars}`
        );

        const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`;

        shader.vertexShader = shader.vertexShader.replace(
          mainVertexString,
          `${mainVertexString}\n${vertexShaderMain}`
        );
      },
    });

    const icosahedron = new THREE.Mesh(geometry, material);

    scene.add(icosahedron);

    camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    const clock = new THREE.Clock();
    let lastTime = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta() / 10;

      lastTime += delta;

      if (material.userData.shader) {
        material.userData.shader.uniforms.uTime.value = lastTime;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      controls.dispose();
      renderer.dispose();

      containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef}></div>;
};

export default IcoSphere;
