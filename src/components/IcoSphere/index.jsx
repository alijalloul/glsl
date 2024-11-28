"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import vertexShaderMain from "./shaders/vertexShaderMain.glsl";
import vertexShaderPars from "./shaders/vertexShaderPars.glsl";

import fragmentShaderMain from "./shaders/fragmentShaderMain.glsl";
import fragmentShaderPars from "./shaders/fragmentShaderPars.glsl";

const IcoSphere = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xe0fffd);
    renderer.setSize(window.innerWidth, window.innerHeight);

    containerRef.current.appendChild(renderer.domElement);

    const directionalLight = new THREE.DirectionalLight("#FFFFFF", 0.6);
    directionalLight.position.set(5, 5, 5);

    const ambientLight = new THREE.AmbientLight("#FFFFFF", 0.2);

    scene.add(directionalLight, ambientLight);

    const geometry = new THREE.IcosahedronGeometry(1, 200);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x03f4fc),
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

        const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`;

        shader.fragmentShader = shader.fragmentShader.replace(
          parsFragmentString,
          `${parsFragmentString}\n${fragmentShaderPars}`
        );

        const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`;

        shader.fragmentShader = shader.fragmentShader.replace(
          mainFragmentString,
          `${mainFragmentString}\n${fragmentShaderMain}`
        );
      },
    });

    const icosahedron = new THREE.Mesh(geometry, material);

    scene.add(icosahedron);

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
