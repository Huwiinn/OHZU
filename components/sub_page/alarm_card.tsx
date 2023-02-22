import { authService, dbService } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import React from "react";
import { RxCross2 } from "react-icons/rx";

const AlarmCard = ({
  post,
  alarm,
  getAlarm,
}: {
  post: AlarmType;
  alarm: AlarmType[];
  getAlarm: () => Promise<void>;
}) => {
  let ResultTime = "";

  if (post?.createdAt) {
    let startTime = parseInt(post.createdAt);
    let nowTime = Date.now();
    let difference = nowTime - startTime;

    difference = Math.trunc(difference / 1000);

    // 초
    const seconds = 1;
    // 분
    const minute = seconds * 60;
    // 시
    const hour = minute * 60;
    // 일
    const day = hour * 24;
    // 달
    const mon = day * 30;
    // 년
    const year = mon * 12;

    if (difference < seconds) {
      ResultTime = "바로"; // 1초보다 작으면 바로 전
    } else if (difference < minute) {
      ResultTime = Math.trunc(difference / seconds) + "초전";
      //분보다 작으면 몇초전인지
    } else if (difference < hour) {
      ResultTime = Math.trunc(difference / minute) + "분전 ";
      //시보다 작으면 몇분전인지
    } else if (difference < day) {
      ResultTime = Math.trunc(difference / hour) + "시간전 ";
      //일보다 작으면 몇시간전인지
    } else if (difference < mon) {
      ResultTime = Math.trunc(difference / day) + "일전 ";
      //달보다 작으면 몇일 전인지
    } else if (difference < year) {
      ResultTime = Math.trunc(difference / mon) + "달전 ";
      //년보다 작으면 몇달전인지
    } else {
      ResultTime = Math.trunc(difference / year) + "년전 ";
    }
  }

  const onClickIsDone = async () => {
    const filterAlarm = alarm.filter((x) => x.createdAt !== post.createdAt);

    const newPost = {
      ...post,
      isDone: !post.isDone,
    };
    filterAlarm.push(newPost);

    await updateDoc(
      doc(dbService, "Users", authService.currentUser?.uid as string),
      {
        alarm: filterAlarm,
      }
    );
    getAlarm();
  };
  const onClickDelete = async () => {
    const filterAlarm = alarm.filter((x) => x.createdAt !== post.createdAt);
    await updateDoc(
      doc(dbService, "Users", authService.currentUser?.uid as string),
      {
        alarm: filterAlarm,
      }
    );
    getAlarm();
  };

  return (
    <div className="w-full px-3 py-2 border-b-[1px] text-textGray border-[#f2f2f2] flex flex-col">
      {post.isDone ? (
        <div className="my-2 text-[12px]  flex w-full justify-between">
          <div onClick={onClickIsDone}>
            <span className="font-bold">{post.nickname}</span>
            님이
            <Link href={`/post/${post.postId}`}>
              <span className="font-bold"> {post.title}</span>에 작성한 댓글
            </Link>
          </div>
          <RxCross2
            className="text-iconDefault cursor-pointer"
            onClick={onClickDelete}
          />
        </div>
      ) : (
        <div className="my-2 text-[12px] flex w-full justify-between">
          <div onClick={onClickIsDone}>
            <span className="font-bold">{post.nickname}</span>
            님이
            <Link href={`/post/${post.postId}`}>
              <span className="font-bold"> {post.title}</span>에 작성한 댓글
            </Link>
          </div>
          <RxCross2
            className="text-iconDefault cursor-pointer"
            onClick={onClickDelete}
          />
        </div>
      )}

      <div className="text-[12px] leading-5">
        <div className=" line-clamp-2">{post.content}</div>
        <div>{ResultTime}</div>
      </div>
    </div>
  );
};

export default AlarmCard;
