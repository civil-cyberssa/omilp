import { ImageResponse } from "next/og"

export const alt = "Omi Tecnologia — software sob medida e sites por assinatura"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at 85% 20%, #4338ff 0, transparent 34%), radial-gradient(circle at 10% 90%, #d000b8 0, transparent 30%), #020617",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "1020px", width: "100%" }}>
        <div style={{ color: "#a9bfff", display: "flex", fontSize: 26, letterSpacing: 5 }}>
          OMI TECNOLOGIA
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05, marginTop: 30 }}>
          Software sob medida e sites por assinatura.
        </div>
        <div style={{ color: "rgba(255,255,255,.7)", display: "flex", fontSize: 28, marginTop: 30 }}>
          Tecnologia para empresas que querem crescer.
        </div>
      </div>
    </div>,
    size,
  )
}
