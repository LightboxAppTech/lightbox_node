const router = require('express').Router()
const register = require('../controller/api/register')
const { getDashboardData } = require('../controller/api/dashboard')
const login = require('../controller/api/login')
const emailVerification = require('../controller/api/email')
const authentication = require('../controller/api/authentication')
const fetchProfile = require('../controller/api/fetch_profile')
const logout = require('../controller/api/logout')
const updateProfile = require('../controller/api/update_profile')
const post = require('../controller/api/post')
const project = require('../controller/api/project')
const connections = require('../controller/api/connections')
const notification = require('../controller/api/notification')
const acceptUser = require('../controller/api/project').acceptUser
const rejectUser = require('../controller/api/project').rejectUser
const cancelProjectRequest =
  require('../controller/api/project').cancelProjectRequest
const password = require('../controller/api/password')
const account = require('../controller/api/account')
const { search } = require('../controller/api/search')
const {
  verifyForgotPasswordCode,
} = require('../controller/api/forgotPassword')
const viewMyProfile = require('../controller/api/viewMyProfile')
const UserProfile = require('../models/userProfile')
const getUser = require('../controller/api/utils/get/get-user')
/**
 *
 *  All routes for lightbox api
 *
 */

// to register new user
router.post('/register', register)
router.post('/verify_email', emailVerification)
router.post('/change_password', password.changePassword)
router.post('/verify_account', account.verifyAccount)
router.post('/verify_forgotPasswordCode', verifyForgotPasswordCode)
router.post('/login', login)

// to authenticate user
router.get('/authenticate', authentication, async (req, res) => {
  let u = await getUser(req)
  const userProfile = await UserProfile.findById(u._id)
  return res.json({
    isProfileCompleted: userProfile ? true : false,
    message: 'authenticated',
  })
})
router.get('/logout', authentication, logout)

router.get('/fetch_profile', authentication, fetchProfile)

// for create new profile and to update existing one
router.post('/update_profile', authentication, updateProfile)

// user dashboard, this is goint to be the main fetch call
router.get('/dashboard', authentication, getDashboardData)

// for write or update the post
router.post('/post', authentication, post.addOrUpdatePost)

// get user's all post
router.get('/get_all_my_posts', authentication, post.getMyAllPost)

router.get('/view_my_profile', authentication, viewMyProfile)

// get single post
router.get('/getpost', authentication, post.getSinglePost)

router.post('/delete_post', authentication, post.deletePost)

// to make a comment on the post
router.post('/comment', authentication, post.addComment)

router.get('/fetch_comments', authentication, post.getComments)

// upvote the post
router.post('/vote', authentication, post.voteThePost)

/**
 * TODO : All endpoint for project are still to verify logically
 *        and syntactically
 *
 */

// to add new project and update existing one
router.post('/update_project', authentication, project.addOrupdateProject)
// to get all the project details
router.get('/get_all_projects', authentication, project.getAllProjects)
// to get all my project details
router.get('/get_all_my_projects', authentication, project.fetchAllMyProject)
// to request new project
router.post('/join_project', authentication, project.requestToJoin)
// to delete project
router.post('/delete_project', authentication, project.deleteProject)
// to complete project
router.post('/complete_project', authentication, project.completeProject)
// to withdraw request made
router.post(
  '/cancel_project_request',
  authentication,
  project.cancelProjectRequest
)
// to fetch project requests
router.get('/project_requests', authentication, project.projectRequests)

//to fetch project details
router.get('/getproject', authentication, project.getProjectDetail)

router.post('/get_messages', authentication, project.getMessages)

//to comment on project
router.post('/project_comment', authentication, project.comment)

//to fetch project comments
router.get('/fetch_project_comments', authentication, project.fetchComments)

// to accept user in project
router.post('/accept_user', authentication, project.acceptUser)
// to reject user in project
router.post('/reject_user', authentication, project.rejectUser)

// get user suggestions
router.get('/suggest_connection', authentication, connections.suggestion)

// this route will reject connection request straight away
router.post('/reject_connection_request', connections.rejectRequest)

// to accept connection request
router.post('/accept_connection', authentication, connections.acceptRequest)

// to make connection request
router.post('/make_connection_request', authentication, connections.makeRequest)

// to remove existing connection
router.post('/remove_connection', authentication, connections.removeConnection)

// to cancel connection request you've made
router.post(
  '/cancel_connection_request',
  authentication,
  connections.cancelConnectionRequest
)

// get data about requests you received
router.get('/request_received', authentication, connections.pendingRequest)

// get data about request you made
router.get('/request_made', authentication, connections.myRequests)

router.get('/myconnections', authentication, connections.myConnections)

router.get('/project_members', authentication, project.getProjectMembers)

// to fetch notifications
router.get(
  '/fetch_notifications',
  authentication,
  notification.fetchNotification
)

router.get('/get_all_chat_messages', authentication, project.getAllChatMessages)

// to fetch notifications
router.post('/mark_all_as_read', authentication, notification.markAllAsRead)

// Search
router.get('/search', authentication, search)

router.post('/mark_as_read', authentication, notification.markAsRead)

module.exports = router
