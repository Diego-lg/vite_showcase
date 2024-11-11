import React, {
  memo,
  Suspense,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import {
  TextureLoader,
  MeshStandardMaterial,
  BackSide,
  ClampToEdgeWrapping,
  BoxGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  LinearFilter,
  MathUtils,
  RepeatWrapping,
  DoubleSide,
} from "three";
import {
  Environment,
  Lightformer,
  ContactShadows,
  OrbitControls,
  useGLTF,
  useTexture,
  Decal,
  Reflector,
} from "@react-three/drei";
import DynamicFerrofluid from "./LoadingFerrofluid";
import { LineSegments } from "three";
import { Edges } from "@react-three/drei";

const Scene = ({ fullTextureUrl, loading, sliderValue }) => {
  const texture = useLoader(TextureLoader, fullTextureUrl);

  // Apply texture settings (wrapping and repetition)
  useEffect(() => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, -1);
  }, [texture]);

  // Offset adjustment for texture based on sliderValue
  useEffect(() => {
    texture.offset.set(sliderValue.x, sliderValue.y);
  }, [texture, sliderValue]);

  const textures = useLoader(TextureLoader, [
    "tshirt/fabric_167_ambientocclusion-4K.png",
    "tshirt/fabric_167_basecolor-4K.png",
    "tshirt/fabric_167_normal-4K.png",
    "tshirt/fabric_167_roughness-4K.png",
  ]);

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        map: texture,
        aoMap: textures[0],
        normalMap: textures[2],
        roughnessMap: textures[3],
        roughness: 0.7,
        metalness: 0.3,
        color: "white",
        side: DoubleSide,
      }),
    [texture, textures]
  );

  const material_2 = useMemo(
    () =>
      new MeshStandardMaterial({
        map: textures[1],
        aoMap: textures[0],
        normalMap: textures[2],
        roughnessMap: textures[3],
        roughness: 0.5,
        metalness: 0.7,
      }),
    [textures]
  );

  const { nodes } = useGLTF("tshirt.glb", true, (error) =>
    console.error(error)
  );
  const { camera } = useThree();

  useEffect(() => {
    const updateCameraPosition = () => {
      if (window.innerWidth < 768) {
        camera.position.set(0, 15, 8);
      } else {
        camera.position.set(0, 8, 5);
      }
      camera.lookAt(0, 0, 0);
    };

    updateCameraPosition();
    window.addEventListener("resize", updateCameraPosition);

    return () => {
      window.removeEventListener("resize", updateCameraPosition);
    };
  }, [camera]);

  // Mark UVs as needing an update

  return (
    <>
      {loading ? (
        <DynamicFerrofluid />
      ) : (
        <mesh
          map={texture}
          castShadow
          receiveShadow
          geometry={nodes.T_Shirt_male.geometry}
          material={material}
          scale={[13, 13, 13]}
          position={[0, 0.5, 0]}
        ></mesh>
      )}
    </>
  );
};

const TshirtShowcase = ({ imageUrl, loading, sliderValue }) => {
  const queryParams = new URLSearchParams(window.location.search);
  const imageurl_shopify =
    imageUrl || queryParams.get("image") || "xamples/010.png";

  return (
    <Canvas
      gl={{
        physicallyCorrectLights: true,
        toneMappingExposure: 1.5,
        antialias: true,
        alpha: false,
      }}
    >
      <Suspense fallback={null}>
        <Environment
          background
          files={["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]}
          path="/background/"
        />

        <Scene
          fullTextureUrl={imageurl_shopify}
          loading={loading}
          sliderValue={sliderValue}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
      <ambientLight intensity={0.8} />
      <directionalLight position={[1, 1, 1]} intensity={0.8} castShadow />
      <directionalLight position={[-1, -1, -1]} intensity={0.4} />{" "}
    </Canvas>
  );
};

export default memo(TshirtShowcase);
