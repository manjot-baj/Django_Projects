import React,  { Suspense, useRef } from "react"
import useFirstViewportEntry from "./FirstViewPort"


const RenderOnViewportEntry =({
    children,
    threshold=0,
    root=null,
    rootMargin="0px 0px 0px 0px ",
    ...wrapperDivProps
})=>{
    const ref= useRef()
    const entered= useFirstViewportEntry(ref,{threshold,root,rootMargin});

    return (
        <div {...wrapperDivProps} ref={ref}>
            {/* Setting up empty fragments insted of Div tag, to avoid the unjargoned redering for data  */}
              {entered && <Suspense fallback={<></>}>{children}</Suspense>} 
        </div>
    )
}

export default RenderOnViewportEntry