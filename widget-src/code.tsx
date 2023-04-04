const { widget } = figma;
const { AutoLayout, Ellipse, Frame, Image, Rectangle, SVG, Text, useSyncedState, useEffect, waitForTask, useSyncedMap } = widget;
const pluginFrameSize = {
  width: 50,
  height: 50,
};

console.clear();
// var usedNode: any[] = []
// var removedNode: any[] = []
var previousStickies: any[] = []
// var username: any[] = []
var avatarColorList = [
  '#14AE5C', '#FFA629', '#F24822', '#9747FF', '#667799', '#FF24BD'
]



const iconChecked = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="11.5" fill="black" stroke="black"/>
<line x1="6.35355" y1="13.6464" x2="9.35355" y2="16.6464" stroke="white"/>
<line x1="6.35355" y1="13.6464" x2="9.35355" y2="16.6464" stroke="white"/>
<line x1="18.3536" y1="8.35355" x2="9.35355" y2="17.3536" stroke="white"/>
<line x1="18.3536" y1="8.35355" x2="9.35355" y2="17.3536" stroke="white"/>
</svg>
`

function Widget() {
  // const [usedNode, setUsedNode] = useSyncedState<any>('usedNode', [])
  const usedNode = useSyncedMap<any>("usedNode")
  // const [removedNode, setRemovedNode] = useSyncedState<any>('removedNode', [])
  const removedNode = useSyncedMap<any>("removedNode")
  // const [previousStickies, setPreviousStickies] = useSyncedState<any>('previousStickies', [])
  // const [username, setUsername] = useSyncedState<any>('username', [])
  const username = useSyncedMap<any>("username")
  const collaborators = useSyncedMap<any>("collaborators")
  // const [contributors, setContributors] = useSyncedState<any>('contributors', [])
  // const [reviews, setReviews] = useSyncedState<any>('reviews', []);
  const [clickedItem, setClickedItem] = useSyncedState<any>('clickedItem', null);
  const [isFirst, setFirst] = useSyncedState<any>('isFirst', true)

  const checkSticky = () => {
    var curStickies = figma.currentPage.findChildren((node:any) => node.type === "STICKY" && removedNode.get(node.id) != 1 && node['authorVisible'])
    const curSections = figma.currentPage.findChildren((node:any) => node.type === "SECTION")
    curSections.forEach((section:any) => {
      let sticky = section.findChildren((node:any) => node.type === "STICKY" && removedNode.get(node.id) != 1 && node['authorVisible'])
      if(sticky?.length > 0) curStickies.push(...sticky)
    })
  
    var stickies = figma.currentPage.findChildren((node:any) => node.type === "STICKY" && usedNode.get(node.id) != 1 && removedNode.get(node.id) != 1 && node['authorVisible']);
    const sections = figma.currentPage.findChildren((node:any) => node.type === "SECTION")
    sections.forEach((section:any) => {
      let sticky = section.findChildren((node:any) => node.type === "STICKY" && usedNode.get(node.id) != 1 && removedNode.get(node.id) != 1 && node['authorVisible'])
      if(sticky?.length) stickies.push(...sticky)
    })
  
    console.log('mytest', curStickies)
    
    var stickyList: { name: any; stickyColor?: string; }[] = [];
    if(previousStickies.length > curStickies.length) {
      
      previousStickies.forEach((sticky:any) => {
        if(curStickies.filter(item => item.id == sticky.id)?.length > 0) {
         
        } else {
          console.log('erasedsti', sticky)
          let newSticky = {
            name: username.get(sticky.id),
          }
          stickyList.push(newSticky)
        }
      })
      if(stickyList.length > 0) {
        removeSticky(stickyList)
      }
    } else {
      stickies.forEach((sticky:any) => {
        // usedNode[sticky.id] = 1
        usedNode.set(sticky.id, 1)
        // username[sticky.id] = sticky['authorName']
        username.set(sticky.id, sticky['authorName'])
        let fill = sticky['fills'][0];
        let newSticky = {
          name: sticky['authorName'],
          stickyColor: `#${Math.floor(fill.color.r * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.g * 255).toString(16).padStart(2, '0')}${Math.floor(fill.color.b * 255).toString(16).padStart(2, '0')}`,
        }
        if(sticky['authorName'] != " ") stickyList.push(newSticky)
      })
      if(stickyList.length > 0) {
        handleSticky(stickyList);
      }
    }
    console.log('pre', previousStickies)
    console.log('cur', curStickies)
    previousStickies = [...curStickies]
    // setPreviousStickies([...curStickies])

  }
  

  const clearSticky = () => {
    previousStickies = []
    // setPreviousStickies([])
    const curStickies = figma.currentPage.findChildren((node:any) => node.type === "STICKY" && removedNode.get(node.id) != 1)
    curStickies.forEach((item:any) => {
      // removedNode[item.id] = 1
      removedNode.set(item.id, 1)
    })
    const curSections = figma.currentPage.findChildren((node:any) => node.type === "SECTION")
    curSections.forEach((section:any) => {
      let sticky = section.findChildren((node:any) => node.type === "STICKY" && removedNode.get(node.id) != 1 && node['authorVisible'])
      sticky.forEach((item:any) => {
        // removedNode[item.id] = 1
        removedNode.set(item.id, 1)
      })
    })
  }

  const moveViewPort = (name: any) => {
    figma.viewport.scrollAndZoomIntoView(figma.currentPage.findChildren((node:any) => username.get(node.id) == name && node.type === "STICKY" && node['authorVisible'])) 
  }

  const onChecked = (e: any, item: any) => {
    console.log('checked', collaborators.get('contributors'), item)
    if(e) {
      collaborators.set('reviews', [...collaborators.get('reviews'), item])
      collaborators.set('contributors', collaborators.get('contributors')?.filter((contributor: any) => contributor.id != item.id))
      // setReviews([...reviews, item])
      // setContributors(contributors.filter((contributor: any) => contributor != item))
    } else {
      collaborators.set('contributors', [...collaborators.get('contributors'), item])
      collaborators.set('reviews', collaborators.get('reviews')?.filter((review: any) => review.id != item.id))
      // setContributors([...contributors, item])
      // setReviews(reviews.filter((review: any) => review != item))
    }
  }

  const handleClickName = (name:any) => {
    // console.log('click name')
    moveViewPort(name)
  }

  const onReset = () => {
    collaborators.set('contributors', [...collaborators.get('contributors'), ...collaborators.get('reviews')])
    collaborators.set('reviews', [])
    // setContributors([...contributors, ...reviews])
    // setReviews([])
  }

  const onClear = () => {
    clearSticky()
    collaborators.set('contributors', [])
    collaborators.set('reviews', [])
    // setContributors([])
    // setReviews([])
  }

  const handleSticky = (stickyList: any) => {
    // var finalContributors = [...contributors]
    // var finalReviews = [...reviews]
    var finalContributors = collaborators.get('contributors') || []
    var finalReviews = collaborators.get('reviews') || []
    stickyList.forEach((sticky: { name: any; stickyColor: any; }) => {
      let isContributor = false
      let isReviewer = false

      console.log('finalcon', finalContributors)
      console.log('newsticky', sticky)
      
      let newContributors = finalContributors.map((contributor: any) => {
        if(contributor.name == sticky.name) {
          isContributor = true;
          contributor.sticky += 1
        }
        return contributor
      })
      console.log('isContributor', isContributor)
      let newReviewer = finalReviews.map((review: any) => {
        if(review.name == sticky.name) {
          isReviewer = true;
          review.sticky += 1;
          return review
        }
      })
      if(isContributor) {
        finalContributors = [...newContributors]
      } else if(isReviewer) {
        finalContributors = [...finalContributors, newReviewer[0]]
        finalReviews = finalReviews.filter((review: any) => review != newReviewer[0])
      } else {
        let userId = new Date().getTime();
        console.log('why', figma.activeUsers.filter(user=> user.name == sticky.name)[0])
        let color = figma.activeUsers.filter(user=> user.name == sticky.name)[0].photoUrl
        // avatarColorList.push(String(color));
        let newUser = {
          id: userId+sticky.name,
          avatarColor: color,
          sticky: 1, 
          name: sticky.name,
          stickyColor: sticky.stickyColor,
          opacity: 0
        }
        finalContributors = [...finalContributors, newUser]
      }
    });
    collaborators.set('contributors', finalContributors)
    collaborators.set('reviews', finalReviews)
    // setContributors(finalContributors)
    // setReviews(finalReviews)
  }

  const removeSticky = (stickyList: any) => {
    // var finalContributors = [...contributors]
    // var finalReviews = [...reviews]
    var finalContributors = collaborators.get('contributors') || []
    var finalReviews = collaborators.get('reviews') || []
    console.log('removesticky', stickyList)
    stickyList.forEach((sticky: { name: any; }) => {
      finalContributors = finalContributors.map((contributor: any) => {
        if(contributor.name == sticky.name) {
          contributor.sticky -= 1
        }
        return contributor.sticky > 0 ? contributor : null
      }).filter((el: any) => el)
      finalReviews = finalReviews.map((review: any) => {
        if(review.name == sticky.name) {
          review.sticky -= 1;
        }
        if(review.sticky > 0) return review
      })
    });
    collaborators.set('contributors', finalContributors)
    collaborators.set('reviews', finalReviews)
    // setContributors(finalContributors)
    // setReviews(finalReviews)
  }

  useEffect(() => {
    if(isFirst) {
      checkSticky()
      setFirst(false)
      // // new Promise((resolve) => {
      // //   // checkSticky()
      // //   setFirst(false)
      // // })
      // new Promise((resolve) => {
      //   setFirst(false)
      //   setInterval(()=> {
      //     checkSticky()
      //   }, 2000)
      //   figma.showUI(__html__, pluginFrameSize);
      // })
    }
  })

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="start"
      verticalAlignItems="center"
      height="hug-contents"
      padding={8}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={12}
      effect={{
        type: 'drop-shadow',
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 0 },
        blur: 2,
        spread: 2,
      }}
      
    >
      {collaborators.get('contributors')?.length === 0 && collaborators.get('reviews')?.length === 0 && (
        <AutoLayout direction="horizontal" verticalAlignItems="center" horizontalAlignItems="center" height={450} width={512}>
          <Text>No contributors</Text>
        </AutoLayout>
      )}
      {collaborators.get('contributors')?.length === 0 && collaborators.get('reviews')?.length > 0 && (
        <AutoLayout direction="vertical" verticalAlignItems="center" horizontalAlignItems="center" height={148} width={512}>
          <Text>Everyone has contributed.</Text>
          <AutoLayout padding={{top: 24}}>
            <AutoLayout direction="horizontal" verticalAlignItems="center" horizontalAlignItems="center" height={43} width={179} cornerRadius={8} stroke="#000000" onClick={()=>onReset()}>
              <Text>Reset Contributors</Text>
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>
      )}
      <Text 
      fontSize={16} 
      lineHeight={19} 
      fontWeight={700} 
      onClick={async ()=> {
        await new Promise((resolve) => {
          setInterval(checkSticky, 500)
          figma.showUI(__html__, pluginFrameSize);
        })
      }}>
        START
      </Text>

      {/* {contributors.length > 0 && ( */}
      {collaborators.get('contributors')?.length > 0 && (
        <>
          <AutoLayout direction="horizontal" verticalAlignItems="center" height={48} padding={{right: 20, left: 20}} spacing={236}>
            <Text fontSize={16} lineHeight={19} fontWeight={400} width={144}>{collaborators.get('contributors')?.length} Contributor</Text>
            <Text fontSize={16} lineHeight={19} fontWeight={700} >Randomize</Text>
          </AutoLayout>
          {collaborators.get('contributors') && collaborators.get('contributors').map((contributor: {
              opacity: number; id: any; avatarColor: any; name: any; stickyColor: any; sticky: any; 
              }) => (
            <AutoLayout key={contributor.id} direction="horizontal" verticalAlignItems="center" padding={{right: 20, left: 20, top: 8, bottom: 8}}>
              <AutoLayout direction="horizontal" verticalAlignItems="center" padding={{right: 45}}>
                <AutoLayout direction="horizontal" verticalAlignItems="center" padding={{right: 16}}>
                  <Ellipse width={24} height={24} stroke="#000000" onClick={(e:any) => {onChecked(true, contributor)}}></Ellipse>
                </AutoLayout>
                <AutoLayout direction="horizontal" verticalAlignItems="center">
                  <Image
                    src={contributor.avatarColor}
                    width={48}
                    height={48}
                    cornerRadius={24}
                  />
                </AutoLayout>
                <AutoLayout direction="horizontal" verticalAlignItems="center" padding={{left: 16}}>
                  <Text fontSize={16} width={282} fontWeight="bold">{contributor.name}</Text>
                </AutoLayout>
              </AutoLayout>
              <AutoLayout direction="horizontal" verticalAlignItems="center" horizontalAlignItems="center" cornerRadius={4} fill={contributor.stickyColor} width={40} height={40}>
                <Text>{contributor.sticky}</Text>
              </AutoLayout>
            </AutoLayout>
          ))}
         
        </>
      )}

      {collaborators.get('reviews')?.length > 0 && (
        <>
          <AutoLayout direction="horizontal" verticalAlignItems="center" height={48} padding={{right: 20, left: 20, top: 10, bottom: 10}}>
            <Text fontSize={16} lineHeight={19} fontWeight={400} width={144}>{collaborators.get('reviews')?.length} Reviewed</Text>
          </AutoLayout>
          {collaborators.get('reviews')?.map((review: { id: any; avatarColor: any; name: any; stickyColor: any; sticky: any; }) => (
            <AutoLayout key={2} direction="horizontal" verticalAlignItems="center" padding={{right: 20, left: 20, top: 8, bottom: 8}}>
              <AutoLayout direction="horizontal" verticalAlignItems="center" padding={{right: 45}}>
                <AutoLayout direction="horizontal" verticalAlignItems="center" padding={{right: 16}}>
                  <SVG
                    src={iconChecked}
                    width={24} 
                    height={24}
                    onClick={(e:any) => {
                      onChecked(false, review)
                    }}
                  />
                </AutoLayout>
                <AutoLayout direction="horizontal" verticalAlignItems="center">
                  <Image
                    src={review.avatarColor}
                    width={48}
                    height={48}
                    cornerRadius={24}
                  />
                </AutoLayout>
                <AutoLayout direction="horizontal" verticalAlignItems="center" padding={{left: 16}}>
                  <Text fontSize={16} width={282} fontWeight="bold">{review.name}</Text>
                </AutoLayout>
              </AutoLayout>
              <AutoLayout direction="horizontal" verticalAlignItems="center" horizontalAlignItems="center" cornerRadius={4} fill={review.stickyColor} width={40} height={40}>
                <Text>{review.sticky}</Text>
              </AutoLayout>
            </AutoLayout>
          ))}
        </>
      )}
      <AutoLayout direction="horizontal" verticalAlignItems="center" stroke="#00000060" height={1} width={512}></AutoLayout>
      <AutoLayout direction="horizontal" verticalAlignItems="center" spacing={32} padding={{top: 20, bottom: 20, left: 20}}>
        <Text fontSize={16} fontWeight="bold" onClick={()=>onReset()}>Reset</Text>
        <Text fontSize={16} fontWeight="bold" onClick={()=>onClear()}>Clear</Text>
      </AutoLayout>
    </AutoLayout>
  );
}
widget.register(Widget);
