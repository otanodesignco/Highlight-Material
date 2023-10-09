import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { useRef } from "react"


const vertex = /*glsl*/`
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vView;
varying vec3 vNormal;

void main()
{

    // uv of the model
    vUv = uv;
    // position in object space mapped between 0-1 to be used as the uv
    vPosition = position * 0.5 + 0.5;
    // object space
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    // object space normal
    vec4 worldNormal = modelMatrix * vec4( normal, 0.0 );
    // normalized view direction
    vView = normalize( cameraPosition - worldPosition.xyz );
    // normalized object normal
    vNormal = normalize( worldNormal.xyz );

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

}
`

const fragment = /*glsl*/`
uniform float uProgress;
uniform float uFresnelAmt;
uniform float uShineSize;
uniform float uShineSpeed;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vView;
varying vec3 vNormal;

void main()
{
    // fade direction using object space y coordinate
    float direction = vPosition.y;
    // dot product of the object normal and view direction used for fresnel & diffuse lighting
    float fresnelSeed = dot( vNormal, vView );
    // fresnel color
    vec3 fresnelColor = vec3( 1.0 );
    // fresnel calculation
    float fresnel = pow( 1.0 - fresnelSeed , uFresnelAmt );
    // fresnel effect
    fresnelColor = fresnelColor * fresnel;
    // uv as object space
    vec2 uv = vPosition.xy;
    // shine calculation
    float shine = step( 1.0 - uShineSize * 0.5, 0.5 + 0.5 * sin( uv.y + uTime * uShineSpeed ) );
    // shine color with alpha used for the shine effect
    vec4 shineColor = vec4( 1.0, 1.0, 1.0, 0.2 );
    // shine effect
    shineColor.xyz += shine;
    // base color with diffuse lighting
    vec3 color = vec3( 0.,0.7,0.5 ) * fresnelSeed;
    // fade direction calculation for alpha transparency
    float fadeDirection = step( uProgress, direction );
    // fade calculation as a color
    vec3 fade = vec3( fadeDirection );
    // final color for outout
    vec3 finalColor = color + fresnelColor;
    // combine final color & shine based on alpha value
    finalColor = mix( finalColor, shineColor.rbg,shine *  shineColor.a );

    gl_FragColor = vec4( finalColor, fade);
}
`

export default function Torus(props)
{

    const uniforms = useRef(
    {
        uProgress: { value: 0 },
        uFresnelAmt: { value: 0 },
        uShineSize: { value: 0 },
        uShineSpeed: { value: 0 },
        uTime: { value: 0 },
    })

    const {progression, fresnelAmt, shineSize, shineSpeed} = useControls({
        progression:
        {
            value: 0,
            min: 0,
            max: 1,
            step: 0.001
        },
        fresnelAmt:
        {
            value: 1,
            min: -3,
            max: 3,
            step: 0.0001
        },
        shineSize:
        {
            value: 0.012,
            min: 0,
            max: 1,
            step: 0.001
        },
        shineSpeed:
        {
            value: 3,
            min: 1,
            max: 20,
            step: 0.001
        }
    })

    useFrame((state) =>
    {
        uniforms.current.uProgress.value = progression
        uniforms.current.uFresnelAmt.value = fresnelAmt
        uniforms.current.uShineSize.value = shineSize
        uniforms.current.uShineSpeed.value = shineSpeed
        uniforms.current.uTime.value = state.clock.elapsedTime

        console.log( uniforms.current.uProgress.value )
    })

    return  <mesh>

<torusKnotGeometry
                args={[ 0.5, 0.2, 110, 20, 2, 3 ]}
            />
            <shaderMaterial
                vertexShader={ vertex }
                fragmentShader={ fragment }
                uniforms={ uniforms.current }
                transparent={ true }
            />

            </mesh>

}