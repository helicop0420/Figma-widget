const { widget } = figma;
const { AutoLayout, Ellipse, Frame, Image, Rectangle, SVG, Text } = widget;
const pluginFrameSize = {
  width: 512,
  height: 500,
};
console.clear();
var usedNode: any[] = []
var removedNode: any[] = []
var previousStickies: any[] = []
var username: any[] = []

const checkSticky = () => {
  const curStickies = figma.currentPage.findChildren((node:any) => node.type === "STICKY" && removedNode[node.id] != 1 && node['authorVisible'])
  const stickies = figma.currentPage.findChildren((node:any) => node.type === "STICKY" && usedNode[node.id] != 1 && removedNode[node.id] != 1 && node['authorVisible']);
  var stickyList: { name: any; stickyColor?: string; }[] = [];
  if(previousStickies.length > curStickies.length) {
    console.log('pre', previousStickies)
    previousStickies.forEach((sticky) => {
      if(curStickies.filter(item => item.id == sticky.id)?.length > 0) {
       
      } else {
        console.log('erasedsti', sticky)
        let newSticky = {
          name: username[sticky.id],
        }
        stickyList.push(newSticky)
      }
    })
    if(stickyList.length > 0) {
      figma.ui.postMessage({
          type: 'remove-sticky',
          stickyList
      });
    }
  } else {
    console.log(stickies)
    stickies.forEach((sticky:any) => {
      usedNode[sticky.id] = 1
      username[sticky.id] = sticky['authorName']
      let fill = sticky['fills'][0];
      let newSticky = {
        name: sticky['authorName'],
        stickyColor: `#${Math.floor(fill.color.r * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.g * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.b * 255).toString(16).padStart(2, '0')}`,
      }
      if(sticky['authorName'] != " ") stickyList.push(newSticky)
    })
    if(stickyList.length > 0) {
      figma.ui.postMessage({
          type: 'get-sticky',
          stickyList
      });
    }
  }
  
  previousStickies = [...curStickies]
}

function Widget() {
  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      height="hug-contents"
      padding={8}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={12}
      onClick={async () => {
        await new Promise((resolve) => {
          figma.showUI(__html__, pluginFrameSize);
          figma.ui.onmessage = async (msg) => {
            if (msg.type === "appInit") {
              setInterval(checkSticky, 500)
            } else if(msg.type == "clearSticky") {
              previousStickies = []
              const curStickies = figma.currentPage.findChildren((node:any) => node.type === "STICKY" && removedNode[node.id] != 1)
              curStickies.forEach((item:any) => {
                removedNode[item.id] = 1
              })
            }
          };
        });
      }}
    >
      <Text fontSize={32} horizontalAlignText="center">
        Click Me
      </Text>
    </AutoLayout>
  );
}
widget.register(Widget);
