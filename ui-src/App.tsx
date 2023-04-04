import * as React from "react";
import { useEffect, useState } from "react";
import "./App.css";
import { Checkbox } from "@mui/material";
import Box from "@mui/material/Box";

import {RadioButtonUnchecked, CheckCircle} from "@mui/icons-material"
import Button from "@mui/material/Button";

var avatarColorList = [
  '#14AE5C', '#FFA629', '#F24822', '#9747FF', '#667799', '#FF24BD'
]

const App = () => {
  const [contributors, setContributors] = useState<any>([]);
  const [reviews, setReviews] = useState<any>([]);
  const [clickedItem, setClickedItem] = useState<any>(null);

  const onChecked = (e: React.ChangeEvent<HTMLInputElement>, item: any) => {
    console.log('checked')
    if(e.target.checked) {
      setReviews([...reviews, item])
      setContributors(contributors.filter((contributor: any) => contributor != item))
    } else {
      setContributors([...contributors, item])
      setReviews(reviews.filter((review: any) => review != item))
    }
  }

  const handleClickName = (name:any) => {
    console.log('click name')
    parent.postMessage({pluginMessage: {type: 'moveViewPort', name}}, '*');
  }

  const onReset = () => {
    setContributors([...contributors, ...reviews])
    setReviews([])
  }

  const onClear = () => {
    parent.postMessage({pluginMessage: {type: 'clearSticky'}}, '*');
    setContributors([])
    setReviews([])
  }

  const handleSticky = (stickyList: any) => {
    var finalContributors = [...contributors]
    var finalReviews = [...reviews]
    stickyList.forEach((sticky: { name: number; stickyColor: any; }) => {
      let isContributor = false
      let isReviewer = false
      
      let newContributors = finalContributors.map(contributor => {
        if(contributor.name == sticky.name) {
          isContributor = true;
          contributor.sticky += 1
        }
        return contributor
      })
      let newReviewer = finalReviews.map(review => {
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
        finalReviews = finalReviews.filter(review => review != newReviewer[0])
      } else {
        let userId = new Date().getTime();
        let color = avatarColorList.shift()
        avatarColorList.push(String(color));
        let newUser = {
          id: userId+sticky.name,
          avatarColor: color,
          sticky: 1, 
          name: sticky.name,
          stickyColor: sticky.stickyColor,
          opacity: 0
        }
        console.log('newuser', newUser)
        finalContributors = [...finalContributors, newUser]
      }
    });
    setContributors(finalContributors)
    setReviews(finalReviews)
  }

  const removeSticky = (stickyList: any) => {
    var finalContributors = [...contributors]
    var finalReviews = [...reviews]
    stickyList.forEach((sticky: { name: any; }) => {
      finalContributors = finalContributors.map(contributor => {
        if(contributor.name == sticky.name) {
          contributor.sticky -= 1
        }
        return contributor.sticky > 0 ? contributor : null
      }).filter((el) => el)
      finalReviews = finalReviews.map(review => {
        if(review.name == sticky.name) {
          review.sticky -= 1;
        }
        if(review.sticky > 0) return review
      })
    });
    console.log('final', finalContributors)
    console.log('finalr', finalReviews)
    setContributors(finalContributors)
    setReviews(finalReviews)
  }

  const handleFigmaMsg = React.useCallback((event) => {
    const msg = event.data.pluginMessage;
    console.log('message', msg);
    const {type, stickyList} = event.data.pluginMessage;
    switch (type) {
      case 'get-sticky':
        handleSticky(stickyList);
        break;
      case 'remove-sticky':
        removeSticky(stickyList);
        break;
      case 'clear-sticky':
        onClear()
        break;
    }
  }, [contributors])

  useEffect(() => {
    parent.postMessage({pluginMessage: {type: 'appInit'}}, '*');
  }, [])
  
  useEffect(() => {
    window.onmessage = handleFigmaMsg
  }, [handleFigmaMsg])

  return (
    <></>
    // <section className="wrap">
    //   {contributors.length === 0 && reviews.length === 0 && (
    //     <p className="emptyText">No contributors</p>
    //   )}
    //   <Box style={{flexGrow: 1}}>
    //     {contributors.length === 0 && reviews.length > 0 && (
    //       <Box sx={{display: 'flex', alignItems:'center', flexDirection: 'column', paddingBottom: '32px'}}>
    //         <p className="contributed">Everyone has contributed.</p>
    //         <Button className="resetBtn" variant="outlined" onClick={onReset}>Reset contributors</Button>
    //       </Box>
    //     )}

    //     {contributors.length > 0 && (
    //       <>
    //         <h1 className="headingTitle">{contributors.length} Contributor</h1>
    //         {contributors.map((contributor: {
    //           opacity: number; id: any; avatarColor: any; name: any; stickyColor: any; sticky: any; 
    //           }) => (
    //           <Box 
    //             key={contributor.id} 
    //             className={contributor.opacity == 0 ? "hoverAnim padding-wrap opacity-0": "hoverAnim padding-wrap opacity-1"}
    //             sx={{
    //               display: 'flex', 
    //               justifyContent:'space-between', 
    //               alignItems: 'center', 
    //               marginBottom: '10px'}}
    //             onClick={() => handleClickName(contributor.name)}
    //           >
    //             <Box sx={{display: 'flex', alignItems: 'center'}}>
    //               <Checkbox
    //                 icon={<RadioButtonUnchecked />}
    //                 checkedIcon={<CheckCircle />}
    //                 color="default"
    //                 size="medium"
    //                 onChange={(e) => onChecked(e, contributor)}
    //                 onClick={(e) => e.stopPropagation()}
    //                 value={false}
    //                 defaultChecked={false}
    //                 sx={{marginLeft: '-9px'}}
    //               />
    //               <div className="userAvatar" style={{backgroundColor: `${contributor.stickyColor}`}} >
    //               </div>
    //               <p  className="userName" ><b>{contributor.name}</b></p>
    //             </Box>
    //             <div className="stickyCounter">
    //               {contributor.sticky}
    //             </div>
    //           </Box>
    //         ))}
    //       </>
    //     )}

    //     {reviews.length > 0 && (
    //       <>
    //         <h1 className="headingTitle"
    //           style={{marginTop:'10px', 
    //           paddingTop:'8px'}}>
    //             Reviewed
    //         </h1>
    //         {reviews.map((review: { id: any; avatarColor: any; name: any; stickyColor: any; sticky: any; }) => (
    //           <Box className="hoverAnim padding-wrap" key={review.id} sx={{display: 'flex', justifyContent:'space-between', alignItems: 'center', marginBottom: '10px'}}>
    //             <Box sx={{display: 'flex', alignItems: 'center'}}>
    //               <Checkbox
    //                 icon={<RadioButtonUnchecked />}
    //                 checkedIcon={<CheckCircle />}
    //                 color="default"
    //                 size="medium"
    //                 defaultChecked
    //                 value={true}
    //                 onChange={(e) => onChecked(e, review)}
    //                 sx={{marginLeft: '-9px'}}
    //               />
    //               <div className="userAvatar" style={{backgroundColor: `${review.stickyColor}`}} >
    //               </div>
    //               <p  className="userName">{review.name}</p>
    //             </Box>
    //             <div className="stickyCounter">
    //               {review.sticky}
    //             </div>
    //           </Box>
    //         ))}
    //       </>
    //     )}
        
        

    //   </Box>
    //   <Box sx={{display: 'flex', 
    //     alignItems: 'center', 
    //     height: '64px', 
    //     borderTop: '1px solid rgba(0, 0, 0, 0.3)', 
    //     padding: '0 20px 0 20px'}}>
    //     <Button className="footBtn" onClick={onReset}>Reset Contributors</Button>
    //     <Button className="footBtn" onClick={onClear}>Clear</Button>
    //   </Box>
    // </section>
  );
};

export default App;
