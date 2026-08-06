great lets begin lets work with 5.3.1 and 5.3.2 

# Overall Roadmap

```text
Phase 5.3.1
├── Native Bottom Sheet
├── Load Comments
├── Loading State
├── Empty State

Phase 5.3.2
├── Comment List
├── Comment Item
├── Avatar
├── Username
├── Timestamp
├── Verified Badge



# Phase 5.3.1 – Bottom Sheet Integration

## Objective

Replace the temporary placeholder with a fully functional native comments container.

---

## Files to Edit

```text
components/feed/CommentSheet.tsx
```

---

## Responsibilities

- Load comments
- Display loading indicator
- Display empty state
- Scrollable comment list
- Close Bottom Sheet
- Connect to existing comment service

---

# Phase 5.3.2 – Comment List

## Objective

Render the complete list of comments.

---

## Files to Create

```text
components/comments/CommentList.tsx

components/comments/CommentItem.tsx
```

---

## Responsibilities

Display:

- User avatar
- Username
- Verified badge
- Timestamp
- Comment text
- Like count

---

frontend-expo\components\feed\CommentSheet.tsx: 
import React, {
  forwardRef,
  useMemo,
} from "react";

import {
  View,
  Text,
} from "react-native";

import BottomSheet, {
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { ViewerPost } from "../../types/post";

import { commentSheetStyles } from "../../styles/feed/commentSheet.styles";

type Props = {
  post: ViewerPost;
};

const CommentSheet = forwardRef<
  BottomSheet,
  Props
>(({ post }, ref) => {
  const snapPoints = useMemo(
    () => ["50%", "85%"],
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <BottomSheetView
        style={commentSheetStyles.container}
      >
        <Text
          style={commentSheetStyles.header}
        >
          Comments
        </Text>

        <View
          style={commentSheetStyles.list}
        >
          <Text
            style={
              commentSheetStyles.emptyText
            }
          >
            Comments for post:
          </Text>

          <Text
            style={
              commentSheetStyles.postId
            }
          >
            {post.id}
          </Text>
        </View>

        <View
          style={
            commentSheetStyles.inputArea
          }
        >
          <Text
            style={
              commentSheetStyles.placeholder
            }
          >
            Comment input coming soon...
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default CommentSheet;

