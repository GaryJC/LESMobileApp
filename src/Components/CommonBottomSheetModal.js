import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet"
import { useEffect, useRef, useState } from "react"

const bottomBackdrop = (props) => (
    <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
    />
)

const bottomBackDropUnpressable = (props) => (
    <BottomSheetBackdrop
        {...props}
        pressBehavior={"none"}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
    />
)

/**
 * 
 * @param {{visible:boolean, onOpen:()=void, onClosed:()=>void, snapPoints:(string | number)[],index:number,closable:boolean}} p
 * @returns 
 */
const CommonBottomSheetModal = ({ visible = false, onOpen, onClosed, snapPoints, index = 0, closable = true, children }) => {
    const [show, setShow] = useState(visible);
    const [_closable, setClosable] = useState(closable);
    const sheetRef = useRef(null);

    const handleSheetChanged = index => {
        if (index == -1) {
            if (onClosed != null) onClosed();
        }
    }

    useEffect(() => {
        setClosable(closable);
    }, [closable])

    useEffect(() => {
        if (visible != show) {
            setShow(visible);
            if (visible) {
                sheetRef.current.present();
                if (onOpen != null) onOpen();
            }
            if (!visible) {
                sheetRef.current.dismiss();
            }
        }
    }, [visible])

    return <BottomSheetModal
        ref={sheetRef}
        index={index}
        snapPoints={snapPoints}
        enablePanDownToClose={_closable}
        backdropComponent={_closable ? bottomBackdrop : bottomBackDropUnpressable}
        enableContentPanningGesture={false}
        backgroundStyle={{ backgroundColor: "#262F38" }}
        onChange={handleSheetChanged}
    >
        {children}
    </BottomSheetModal>

}

export default CommonBottomSheetModal;