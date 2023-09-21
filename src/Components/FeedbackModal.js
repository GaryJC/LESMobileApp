import { Modal, Text, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import HighlightButton from "./HighlightButton";


class DialogButton {
  /**
   * @type {string}
   */
  id;
  /**
   * @type {string}
   */
  text;
  /**
   * @type {'normal'|'primary'|'danger'|'emphasize'|'dark'|'light'|'opacity'|null}
   */
  type;
  /**
   * @type {boolean}
   */
  isLoading;

  constructor(id, text, type, isLoading) {
    this.id = id;
    this.text = text;
    this.type = type;
    this.isLoading = isLoading;
  }

  /**
   * 
   * @param {string} id button id
   * @param {string} text 
   * @param {'normal'|'primary'|'danger'|'emphasize'|'dark'|'light'|'opacity'|null} type 
   * @param {boolean} isLoading
   * @returns {DialogButton}
   */
  static New(id, text, type, isLoading = false) {
    return new DialogButton(id, text, type, isLoading);
  }

  static Ok() {
    return DialogButton.New("ok", "Ok", "primary")
  }

  static Cancel() {
    return DialogButton.New("cancel", "Cancel", "normal")
  }

}

const defaultButton = [
  DialogButton.Ok()
];

/**
 * 
 * 弹出对话框
 * 
 * 默认显示一个Ok按钮
 * 
 * 自定义按钮方式
 * 
 * <DialogModal 
 * 
 *    content={content}
 * 
 *    visible={visible}
 * 
 *    buttons={[
 * 
 *      DialogButton.OK(),
 *      DialogButton.Cancel(),
 *      DialogButton.New("custom","Custom","normal",isLoading)
 * 
 *    ]}
 * />
 * 
 * @param {{visible:boolean, onButtonPressed:(button:DialogButton)=>void, title:string|null, content:string, buttons: DialogButton[]|DialogButton|null}} p 
 * @returns 
 */
const DialogModal = ({ visible, onButtonPressed, title, content, buttons }) => {

  const btns = buttons == null
    ? defaultButton
    : Array.isArray(buttons) ? buttons : [buttons];

  const onBtnPressed = btn => {
    if (onButtonPressed != null) {
      onButtonPressed(btn);
    }
  }

  const btnDoms = btns.map(btn => {
    return <HighlightButton
      type={btn.type}
      text={btn.text}
      isLoading={btn.isLoading}
      onPress={() => {
        onBtnPressed(btn);
      }}
    />
  })

  const titleDom = (title == null || title == "")
    ? <View className="pt-[10px]"></View>
    : <View className="flex justify-start">
      <Text className=" text-xl text-white font-bold">{title}</Text>
      <View className="h-[2px] bg-clr-bgdark my-[5px]"></View>
    </View>

  return (
    <Modal visible={visible} transparent={true} className="flex">
      <View className="justify-center items-center bg-black/[0.6] flex-1">
        <View className="bg-[#262F38] rounded px-[20px] py-[10px] flex">
          {titleDom}
          <Text className="text-white text-[16px] mb-[10px]">{content}</Text>
          <View className="flex-row justify-center items-center ">
            {btnDoms}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * @deprecated 改用DialogModal
 */
const FeedBackModal = ({
  feedbackModalOpen,
  setFeedbackModalOpen,
  feedback,
  children,
}) => {
  return (
    <Modal visible={feedbackModalOpen} transparent={true} className="flex">
      <View className="justify-center items-center bg-black/[0.6] flex-1">
        <View className="bg-[#262F38] rounded justify-center items-center p-[20px]">
          <Text className="text-white text-[16px] mb-[10px]">{feedback}</Text>
          <View className="flex-row">
            {children}
            <HighlightButton
              type={"normal"}
              text={"Cancel"}
              onPress={() => setFeedbackModalOpen(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedBackModal;
export { DialogModal, DialogButton }
