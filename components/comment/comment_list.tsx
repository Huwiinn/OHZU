import { authService, dbService } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import DeleteModal from "../delete_modal";
import Grade from "../grade";
import Recomments from "./recomments";

interface CommentProps {
  comment: CommentType;
  currentUser: UserType;
  dateForm: string;
}

const CommentList = ({ comment, currentUser, dateForm }: CommentProps) => {
  const { content, createdAt, userId, id, isEdit } = comment;

  const [editContent, setEditComment] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserType>();
  const [recomments, setRecomments] = useState<CommentType[]>([]);

  const editToggle = async () => {
    await updateDoc(doc(dbService, "Comments", id as string), {
      isEdit: !isEdit,
    });
  };

  const editComment = async (id: string, edit: any) => {
    await updateDoc(doc(dbService, "Comments", id), {
      ...comment,
      content: edit,
      isEdit: false,
    });
    setEditComment("");
  };

  const deleteToggle = () => {
    setDeleteConfirm(!deleteConfirm);
  };

  const deleteComment = async (id: string) => {
    await deleteDoc(doc(dbService, "Comments", id));
  };

  const getCommentUser = async () => {
    if (comment?.userId) {
      const userRef = doc(dbService, "Users", comment?.userId! as string);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const newUser = {
        ...userData,
      };

      setUser(newUser);
    }
  };

  const resetToggle = async () => {
    await updateDoc(doc(dbService, "Comments", id as string), {
      isEdit: false,
    });
    setDeleteConfirm(false);
  };

  const getRecomments = async () => {
    const q = query(
      collection(dbService, "Recomments"),
      orderBy("createdAt", "desc"),
      where("commentId", "==", id as string)
    );

    onSnapshot(q, (snapshot) => {
      // q (쿼리)안에 담긴 collection 내의 변화가 생길 때 마다 매번 실행됨
      const newRecomments = snapshot.docs.map((doc: any) => {
        const newRecomment = {
          id: doc.id,
          ...doc.data(), // doc.data() : { text, createdAt, ...  }
        };
        return newRecomment;
      });
      setRecomments(newRecomments);
    });
  };

  useEffect(() => {
    resetToggle();
    getCommentUser();
    getRecomments();
    return;
  }, []);

  return (
    <>
      <li className="flex justify-between py-6">
        <div className="flex space-x-6 w-full">
          <Link
            href={`/users/${comment.userId}`}
            className="flex flex-col items-center space-y-2 w-[13%]"
          >
            <img
              src={user?.imageURL}
              className="bg-slate-300 w-[40px] aspect-square rounded-full object-cover"
            />
            <div className="flex justify-start space-x-1">
              <span className="text-xs">{user?.nickname}</span>
              <span className="w-[12px]">
                <Grade score={user?.point!} />
              </span>
            </div>
          </Link>
          <div className="space-y-2 flex flex-col justify-between w-full">
            {isEdit ? (
              <textarea
                name="editContent"
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setEditComment(e.target.value);
                }}
                className="w-full p-2 border h-10 resize-none placeholder:text-sm scrollbar-none"
                placeholder={content}
              />
            ) : (
              <pre className="whitespace-pre-wrap">{content}</pre>
            )}
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 flex items-end">
                {createdAt}
              </span>
              {isEdit && (
                <div className="flex justify-end items-end space-x-2">
                  <button className="text-xs font-medium" onClick={editToggle}>
                    취소
                  </button>
                  <button
                    className="text-xs font-medium"
                    onClick={() => editComment(id as string, editContent)}
                  >
                    완료
                  </button>
                </div>
              )}
              {authService.currentUser?.uid === userId ? (
                <div
                  className={`${
                    isEdit ? "hidden" : "flex"
                  } flex justify-end items-end space-x-2 text-gray-500 text-xs w-1/6`}
                >
                  <button onClick={editToggle}>수정</button>
                  {/* <button onClick={() => deleteComment(id as string)}>삭제</button> */}
                  <button onClick={deleteToggle}>삭제</button>
                  {recomments.length === 0 ? (
                    <button
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                    >
                      답글달기
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                    >
                      답글 {recomments.length}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex justify-end items-end space-x-2 text-gray-500 text-xs w-1/6">
                  <button>신고</button>
                  {recomments.length === 0 ? (
                    <button
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                    >
                      답글달기
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                    >
                      답글 {recomments.length}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {deleteConfirm && (
          <DeleteModal
            deleteComment={deleteComment}
            setDeleteConfirm={setDeleteConfirm}
            id={id}
            text="댓글"
          />
        )}
      </li>
      {isOpen && (
        <Recomments
          id={id!}
          dateForm={dateForm}
          currentUser={currentUser}
          recomments={recomments}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </>
  );
};

export default CommentList;
