import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";
import Navigationbar from "../components/Navigationbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserInfo from "../components/UserInfo";
import { ToastContainer, toast, Bounce } from "react-toastify";

import {
  faHandsClapping,
  faComment,
  faBookmark,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

import { method } from "lodash";

export default function PostDetails() {
  const { id } = useParams(); // <-- Get post ID from the URL
  const [post, setPost] = useState(null);
  const [followedIds, setFollowedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [savedPostsIds, setSavedPostsIds] = useState([]);
  const [likesPostsIds, setLikesPostsIds] = useState([]);
  const [showResponses, setShowResponses] = useState(false);
  const [responseData, setResponseData] = useState("");
  const [postResponses, setPostResponses] = useState([]);
  const navigate = useNavigate();

  const toggleResponses = () => setShowResponses((prev) => !prev);

  // Get all comments that belongs to the post_id
  useEffect(() => {
    const handlePostResponses = async () => {
      const response = await apiRequest(
        `http://localhost:8000/comments/${id}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPostResponses(data);
      } else {
        console.error(
          `Failed to load all the responses that belongs to post_id with post id: ${id}`,
          data.error
        );
      }
    };

    handlePostResponses();
  }, []);

  // leave comment on a post
  const handlePostResponse = async (post_id) => {
    const response = await apiRequest(
      `http://localhost:8000/comments/${post_id}`,
      {
        method: "POST",
        body: JSON.stringify({
          content: responseData,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Response has been made");
      setResponseData("");
    } else {
      console.error(
        `Failed to leave a response on post with post id: ${post_id}`,
        data.error
      );
    }
  };

  // Get all the saved posts
  useEffect(() => {
    const handleSavedPosts = async () => {
      const response = await apiRequest(`http://localhost:8000/posts/saved`, {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        // extract all ids of the saved posts
        setSavedPostsIds(data.map((post) => post.id));
      } else {
        console.error("Failed to fetch saved posts ids:", data.error);
      }
    };

    handleSavedPosts();
  }, []);

  // save posts
  const handleSavingPost = async (post_id) => {
    const response = await fetch(
      `http://localhost:8000/posts/save/${post_id}`,
      {
        method: "POST",
        credentials: "include", // to send cookies for JWT
      }
    );

    const data = await response.json();

    if (response.ok) {
      // success saving post"
    } else {
      console.error("Failed to save the post");
    }
  };

  // Get current user
  useEffect(() => {
    const handleCurrentUser = async () => {
      const response = await apiRequest("http://localhost:8000/users/current", {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.current_user);
      } else {
        console.error("Failed to fetch current user:", data.error);
      }
    };

    handleCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser === null) return;
    const fetchFollowedIds = async () => {
      const response = await fetch(
        `http://localhost:8000/followers/following/ids/${currentUser}`,
        {
          method: "GET",
          credentials: "include", // to send cookies for JWT
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFollowedIds(data.following_ids);
      } else {
        console.error("Failed to fetch following ids");
      }
    };

    fetchFollowedIds();
  }, [currentUser]);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await apiRequest(`http://localhost:8000/posts/${id}`, {
        method: "GET",
      });

      const data = await res.json();

      if (res.ok) {
        setPost(data);
      } else {
        console.error("Error loading post:", data.error);
      }
    };

    fetchPost();
  }, [id]);

  const handleLikePost = async (post_id) => {
    const res = await apiRequest(`http://localhost:8000/likes/${post_id}`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
    } else {
      console.error("Error loading post:", data.error);
    }
  };

  if (!post) return <div className="p-4">Loading...</div>;

  const handleFollow = async (author_id) => {
    const response = await apiRequest(
      `http://localhost:8000/followers/${author_id}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Successful following...");
    } else {
      console.error("Failed to follow:", post.user_id, data.error);
    }
  };

  const handleUnFollow = async (author_id) => {
    const response = await apiRequest(
      `http://localhost:8000/followers/${author_id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Successful unfollowing...");
    } else {
      console.error("Failed to unfollow:", author_id, data.error);
    }
  };

  const deletePost = async (post_id) => {
    const response = await apiRequest(
      `http://localhost:8000/posts/${post_id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (response.ok) {
      // when successfully deleted, navigate to the contents page
      navigate("/contents", { replace: true });
    } else {
      console.error("Failed to delete post:", author_id, data.error);
    }
  };

  // date and time formatter
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const notify = (message) => {
    const toastId = "save-success";

    if (!toast.isActive(toastId)) {
      toast.success(message, {
        toastId,
      });
    }
  };

  const notifyAlready = (message) => {
    const toastId = "already-saved";

    if (!toast.isActive(toastId)) {
      toast.info(message, {
        toastId,
      });
    }
  };

  return (
    <>
      <Navigationbar showWriteButton={true} showSearchBar={false} />
      <div className="container mt-10 mx-auto w-[1060px] w-[95%] lg:w-[80%] xl:w-[55%] p-8">
        <div className="post-headers">
          <h1 className="text-5xl w-200 font-bold box-content text-start">
            {post.title}
          </h1>
          <div className="text-sm w-100 my-5">
            <span className="author-name">
              <UserInfo userId={post.user_id} />
            </span>
            {currentUser != post.user_id &&
              (followedIds.includes(post.user_id) ? (
                <button
                  onClick={() => {
                    // unfollow post.user_id
                    handleUnFollow(post.user_id);
                    // Remove post.user_id from followedIds
                    setFollowedIds((prev) =>
                      prev.filter((id) => id !== post.user_id)
                    );
                    notify("Successful unfollowing...");
                  }}
                  className="inline-block ml-5 follow-btn bg-gray-200 p-2 w-20 rounded-full cursor-pointer"
                >
                  Following
                </button>
              ) : (
                <button
                  onClick={() => {
                    // follow post.user_id
                    handleFollow(post.user_id);
                    // Update UI state when a new author's id is added
                    setFollowedIds((prev) => [...prev, post.user_id]);
                    notify("Successful following...");
                  }}
                  className={`inline-block ml-5 follow-btn bg-gray-200 p-2 w-20 rounded-full cursor-pointer`}
                >
                  Follow
                </button>
              ))}
            <span className="created_at ml-5">
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>
        <div className="claps-comments-wrapper">
          <div className="post-info border-y border-gray-200">
            <div className="p-2">
              <button onClick={toggleResponses}>
                <FontAwesomeIcon
                  title="Leave Comment"
                  icon={faComment}
                  size="lg"
                  className="text-gray-500 cursor-pointer"
                />
              </button>
              <span className="post-comments text-sm text-gray-500 ml-1 mr-2">
                {post.comment_count}
              </span>{" "}
              <button
                onClick={() => {
                  handleLikePost(post.id);
                  {
                    !likesPostsIds.includes(post.id)
                      ? notify("Post Liked!")
                      : notifyAlready("Post liked already!");
                  }
                }}
              >
                <FontAwesomeIcon
                  title="Clap"
                  icon={faHandsClapping}
                  size="lg"
                  className="text-gray-500 cursor-pointer"
                />
              </button>
              <span className="post-likes text-sm text-gray-500 ml-1">
                {post.like_count}
              </span>{" "}
              <div className="float-right">
                <button
                  onClick={() => {
                    handleSavingPost(post.id);
                    {
                      !savedPostsIds.includes(post.id)
                        ? notify("Post saved!")
                        : notifyAlready("Post already saved");
                    }
                  }}
                >
                  {currentUser !== post.user_id && (
                    <FontAwesomeIcon
                      title="Save"
                      icon={faBookmark}
                      className="text-gray-500 cursor-pointer"
                    />
                  )}
                </button>

                {/* show the delete and edit buttons on posts that belongs the current user */}
                {currentUser === post.user_id && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/edit-post/${post.id}`);
                      }}
                    >
                      <FontAwesomeIcon
                        title="Edit"
                        icon={faEdit}
                        className="ml-2 text-gray-500 cursor-pointer"
                      />
                    </button>
                    <button
                      onClick={() => {
                        deletePost(post.id);
                        console.log(post.id);
                      }}
                    >
                      <FontAwesomeIcon
                        title="Save"
                        icon={faTrash}
                        className="ml-2 text-gray-500 cursor-pointer"
                        style={{ color: "F2F2F2" }}
                      />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <ToastContainer
            position="top-center"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </div>
        <div className="post-content-wrapper w-[1000px] mt-5">
          <p className="text-justify whitespace-pre-wrap py-5 pr-5">
            {post.content}
          </p>
        </div>
      </div>

      {/* Responses Section */}
      {showResponses && (
        <div className="fixed top-0 right-0 w-[400px] h-screen bg-white shadow-lg overflow-y-auto p-4">
          <h1 className="text-lg font-semibold mb-4 pb-4 border-b border-gray-200">
            Responses{" "}
            {"(" + (postResponses.length > 0 ? postResponses.length : 0) + ")"}
          </h1>
          <textarea
            required
            name="comment"
            className="w-full p-2 border border-gray-200 rounded resize-none h-44 text-sm"
            value={responseData}
            onChange={(e) => setResponseData(e.target.value)}
            placeholder="What are your thoughts?"
          ></textarea>
          <div className="flex justify-end">
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer text-sm"
              onClick={() => {
                handlePostResponse(post.id);
              }}
            >
              Respond
            </button>
          </div>

          <div className="mt-9">
            {postResponses.length > 0 &&
              postResponses.map((response) => (
                <div key={response.id} className="mb-1 p-3 bg-white shadow">
                  <div className="text-sm text-gray-700">
                    <span className="mr-3 font-bold">
                      <UserInfo userId={response.user_id} />
                    </span>
                    {formatDate(response.created_at)}
                  </div>
                  <p className="text-sm text-gray-800">{response.content}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
