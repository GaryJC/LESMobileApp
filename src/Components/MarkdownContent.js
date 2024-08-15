import { View } from "react-native";
import Markdown from "react-native-markdown-display";

export default function MarkdownContent({ content }) {
  // Replace <br/> tags with markdown line breaks
  let markdownContent = content.replace(/<br\s*\/?>/g, "\n");

  // Replace <a> tags with markdown link syntax
  markdownContent = markdownContent.replace(
    /<a href="(.*?)".*?>(.*?)<\/a>/g,
    "[$2]($1)"
  );

  return (
    <View className="bg-white rounded-lg p-4">
      <Markdown>{markdownContent}</Markdown>
    </View>
  );
}
