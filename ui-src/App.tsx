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
    <section className="wrap">
      <div>
        <div className="alert-header">Only you can see this. This window must be open to record real-time feedback.</div>
        <div className="blog"><b>Begin session</b>  for this widget to start recording stickies from contributors</div>
        <div className="blog"><b>Reset</b> will take all contributors out of the reviewed section</div>
        <div className="blog"><b>New session</b> will remove stickie count and contributors. This is great if you are doing multiple rounds. </div>
        <div className="blog"><b>Randomize</b> will shuffle the order of contributors.</div>
      </div>
    </section>
  );
};

export default App;
