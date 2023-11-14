import { Ionicons } from '@expo/vector-icons';
import { LesConstants } from "les-im-components";
import { Image, ScrollView, Text, View, Dimensions, TouchableHighlight, Linking } from "react-native";
import Divider from "../Components/Divider";
import { Notification } from "../Models/Notifications";
import Constants from "../modules/Constants";
import formatDate from "../utils/formatDate";
import ScaledImage from '../Components/ScaledImage';
import HighlightButton from '../Components/HighlightButton';
import { useState } from 'react';
import NotificationService from '../services/NotificationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
export default NotificationDetailScreen = ({ route, navigation }) => {
    /**
     * @type {{notification:Notification}}
     */
    const { notification } = route.params;

    const [loading, setLoading] = useState(false);

    return <View className="m-2 mt-5 h-full">
        <View className="flex flex-row ">
            <View>
                <Image source={Constants.Icons.getSystemIcon(notification.sender.id)}
                    className="rounded-full w-[50px] h-[50px]" />
            </View>
            <View className="flex ml-[10px] flex-1">
                <Text className="text-base text-white">From</Text>
                <View className="flex flex-row items-center">
                    <Text className="text-base text-white font-bold pr-1">{notification.sender.name}</Text>
                    <View className="lex flex-row bg-green-300 rounded-full p-[2px] border border-black w-[28px] justify-center items-center">
                        <Ionicons name="shield-checkmark-outline" size={20} color="black" />
                    </View>
                </View>
            </View>
            <View className="flex">
                <Text className="text-white text-[12px] mb-2 pl-1">
                    {formatDate(new Date(notification.time), {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                    })}
                </Text>
                <HighlightButton
                    type="danger"
                    text='delete'
                    icon={<Ionicons name="trash-outline" size={20} color="white" />}
                    isLoading={loading}
                    onPress={() => {
                        setLoading(true);
                        NotificationService.Inst.deleteSystemNotification(notification.id).then(id => {
                            setLoading(false);
                            navigation.goBack();
                        });
                    }}
                />
            </View>
        </View>
        <Divider />
        <View className="flex w-full bg-black mb-2 rounded-xl">
            <Text className="text-white text-lg font-bold py-2 text-center">{notification.content.title}</Text>
        </View>
        <NotificationContent content={notification.content.content} />
    </View>
}
/**
 * 
 * @param {{content:string}} param0 
 * @returns 
 */
const NotificationContent = ({ content }) => {

    const contents = processContent(content);

    let idx = 0;
    const doms = contents.map(c => {
        const dom = contentToDom(c);
        dom.key = idx++;
        return dom;
    })

    return <View className="flex-1 mb-[50px]">
        <ScrollView >
            <View className="">
                {doms}
            </View>
        </ScrollView>
    </View>
}

/**
 * 
 * @param {Content} content 
 * @returns {Content}
 */
const contentToDom = (content) => {
    switch (content.type) {
        case 'text':
            return <Text className="text-base text-white">{content.text}</Text>
        case 'image':
            const img = <ScaledImage uri={content.imageUrl} width={screenWidth - 20} />
            if (content.link && content.link.length > 0) {
                console.log("===", content)
                return <TouchableHighlight onPress={() => Linking.openURL(content.link)}>
                    {img}
                </TouchableHighlight>
            } else {
                return img
            }
        case 'button':
            return <View className="my-1">
                <HighlightButton
                    icon={<Image source={Constants.Icons.getSystemIcon(content.imageUrl)} className="w-[20px] h-[20px]" />}
                    type={"normal"}
                    text={<Text className="text-white text-base">{content.text}</Text>}
                    onPress={() => {
                        Linking.openURL(content.link);
                    }}
                />
            </View>
    }
    return null;
}

/**
 * 
 * @param {string} content 
 * @returns {Content[]}
 */
const processContent = (content) => {
    if (!content.includes("[!")) {
        return [newTextContent(content)];
    } else {
        let c = content;
        const ret = [];

        while (c.length > 0) {
            const idx = c.indexOf("[!");
            let dom = null;
            if (idx == 0) {
                const end = c.indexOf("]");
                const tag = c.slice(0, end + 1);
                dom = retrieveTag(tag);
                c = c.slice(end + 1);
            } else if (idx > 0) {
                const text = c.slice(0, idx);
                //console.log("processing text", text);
                dom = newTextContent(text);
                c = c.slice(idx);
            } else {
                //idx==-1
                const text = c;
                //console.log("processing text", text);
                dom = newTextContent(text);
                c = "";
            }
            if (dom) {
                dom.key = ret.length;
                ret.push(dom);
            }
        }
        return ret;
    }
}

/**
 * 
 * @param {string} tag 
 */
const retrieveTag = (tag) => {
    const reg = /\[!([^\s]+).*/
    const result = tag.match(reg);
    const type = result[1];
    switch (type) {
        case "image":
            const imgReg = /\[!image src=(.*) link=(.*)\]/
            const imgResult = tag.match(imgReg);
            if (imgResult.length >= 2) {
                const url = imgResult[1];
                let link = "";
                if (imgResult.length >= 3) {
                    link = imgResult[2];
                }
                return newImageContent(url, link);
            } else {
                console.error("image tag format error expecting[!image src= link=]: " + tag);
                return newTextContent("");
            }
            break;
        case "button":
            const btnReg = /\[!button title=(.*) link=(.*) image=(.*)\]/
            const btnResult = tag.match(btnReg);
            if (btnResult.length == 4) {
                const title = btnResult[1];
                const link = btnResult[2];
                const image = btnResult[3];
                return newButtonContent(title, image, link);
            } else {
                console.error("button tag format error expecting[!button title=  link=  image=]: " + tag);
                return newTextContent("");
            }
        default:
            //unknown type
            return newTextContent(tag);
    }
}

const newTextContent = (text) => {
    const content = new Content();
    content.type = "text";
    content.text = text;
    return content;
}

const newButtonContent = (text, image, link) => {
    const content = new Content();
    content.type = "button";
    content.text = text;
    content.imageUrl = image;
    content.link = link;
    return content;
}

const newImageContent = (imageUrl, link) => {
    const content = new Content();
    content.type = "image";
    content.imageUrl = imageUrl;
    content.link = link;
    return content;
}

class Content {
    /**
     * @type {"text"|"image"|"button"}
     */
    type;

    /**
     * 类型为text时的文本内容
     * @type {string}
     */
    text;

    /**
     * 类型为image时的图片链接,button时为图标名称
     * @type {string}
     */
    imageUrl;

    /**
     * 类型为image|button时图片点击跳转页面，可以为空
     * @type {string}
     */
    link;
}