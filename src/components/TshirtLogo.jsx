import React, { memo, Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  TextureLoader,
  MeshStandardMaterial,
  RepeatWrapping,
  DoubleSide,
  Vector3,
  ClampToEdgeWrapping,
} from "three";
import { Environment, OrbitControls, useGLTF, Decal } from "@react-three/drei";

const Scene = ({ fullTextureUrl, loading, sliderValue, toggled, color }) => {
  const texture = useLoader(TextureLoader, fullTextureUrl);
  const textures = useLoader(TextureLoader, [
    "/tshirt/fabric_167_ambientocclusion-4K.png",
    "/tshirt/fabric_167_basecolor-4K.png",
    "/tshirt/fabric_167_normal-4K.png",
    "/tshirt/fabric_167_roughness-4K.png",
  ]);

  useEffect(() => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(toggled ? 1 : 2, -1);
    texture.needsUpdate = true;
  }, [texture, toggled]);

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
        aoMap: textures[0],
        normalMap: textures[2],
        roughnessMap: textures[3],
        roughness: 0.7,
        metalness: 0.3,
        side: DoubleSide,
        color: color,
      }),
    [textures]
  );

  useEffect(() => {
    if (material_2) {
      material_2.color.set(color);
      material_2.needsUpdate = true;
    }
  }, [color, material_2]);

  const { nodes } = useGLTF("/tshirt.glb");
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

  return (
    <>
      {loading ? (
        <DynamicFerrofluid />
      ) : (
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.T_Shirt_male.geometry}
          scale={[13, 13, 13]}
          position={[0, 0.5, 0]}
          material={material_2}
        >
          <Decal
            position={[
              0.18 - sliderValue.x / 5 - 0.1,
              0.3 - sliderValue.y / 3 - 0.2,
              0.15,
            ]}
            rotation={[0, 0, 0]}
            scale={[0.1, -0.1, 0.15]}
            map={texture}
            material={material}
          />
        </mesh>
      )}
    </>
  );
};

function DynamicFerrofluid() {
  return <div>Loading...</div>;
}

const TshirtLogo = ({ imageUrl, loading, sliderValue, toggled, color }) => {
  const queryParams = new URLSearchParams(window.location.search);
  const imageurl_shopify =
    imageUrl || queryParams.get("image") || "/xamples/010.png";

  return (
    <div className="w-full h-screen">
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
            toggled={toggled}
            color={color}
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
        <directionalLight position={[-1, -1, -1]} intensity={0.4} />
      </Canvas>
    </div>
  );
};

export default memo(TshirtLogo);
