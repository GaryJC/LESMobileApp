import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

const bottomBackdrop = (props) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

const bottomBackDropUnpressable = (props) => (
    <BottomSheetBackdrop
        {...props}
        pressBehavior={"none"}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
    />
);

/**
 *
 * @param {{visible:boolean,enableContentPanningGesture:boolean, onOpen:()=void, onClosing:()=>void,onClosed:()=>void, onIndexChanged:(index)=>void, title:string|null,snapPoints:(string | number)[],index:number,closable:boolean}} p
 * @returns
 */
const CommonBottomSheetModal = ({ visible = false, enableContentPanningGesture, onOpen, onClosing, onClosed, onIndexChanged, title = "", snapPoints, index = 0, closable = true, children }) => {
    const [show, setShow] = useState(visible);
    const [_closable, setClosable] = useState(closable);
    const sheetRef = useRef(null);
    const [sheetIndex, setSheetIndex] = useState(-1);

    const handleSheetChanged = (index) => {
        setSheetIndex(index);
        if (onIndexChanged != null) {
            onIndexChanged(index);
        }

        if (index == -1) {
            if (onClosed != null) onClosed();
            setShow(false);
        }
    };

    useEffect(() => {
        setClosable(closable);
    }, [closable]);

    useEffect(() => {
        if (visible != show) {
            setShow(visible);
            if (visible) {
                sheetRef.current.present();
                if (onOpen != null) onOpen();
            }
        }
        if (!visible) {
            sheetRef.current.dismiss();
        }
    }, [visible]);

    const text = title == null || title == "" ? null
        : <View className="flex justify-center items-center w-full mb-2">
            <Text className="text-white text-lg font-bold">{title}</Text>
        </View>

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={show ? index : -1}
            snapPoints={snapPoints}
            enablePanDownToClose={_closable}
            backdropComponent={_closable && sheetIndex != -1 ? bottomBackdrop : bottomBackDropUnpressable}
            enableContentPanningGesture={enableContentPanningGesture}
            backgroundStyle={{ backgroundColor: "#262F38" }}
            onChange={handleSheetChanged}
        >
            {text}
            {children}
        </BottomSheetModal>
    );
};

export default CommonBottomSheetModal;
