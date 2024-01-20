const User = require('../../models/userProfile')
const UserProfile = require('../../models/userProfile')
const Project = require('../../models/project')
const Post = require('../../models/post')
const sw = require('stopword')
const sessionUser = require('../api/utils/get/user')

const search = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const query = req.query.query
    if (!query) return res.end()

    const tokens = sw.removeStopwords(query.split(' '))
    const capitalTokens = []
    for (let i = 0; i < tokens.length; i++) {
      capitalTokens.push(tokens[i][0].toUpperCase() + tokens[i].substring(1))
    }

    const searchQuery = tokens.join(' ')
    const searchResult = { posts: [], users: [], projects: [] }

    const users1 = await User.find({
      $or: [
        { fname: { $in: capitalTokens } },
        { lname: { $in: capitalTokens } },
        { fname: { $in: tokens } },
        { lname: { $in: tokens } },
        { college: { $in: capitalTokens } },
        { college: { $in: tokens } },
        // { $text: { $search: searchQuery, $caseSensitive: true } },
      ],
      college: user.college,
    }).lean(true)

    const tmp1 = await User.find({
      $text: { $search: searchQuery, $caseSensitive: false },
      college: user.college,
    })
      .lean(true)
      .limit(20)

    const queriedUsers = []
    users1.forEach((user) => {
      queriedUsers.push(user._id)
    })
    tmp1.forEach((user) => {
      queriedUsers.push(user._id)
    })

    const projectData = []

    var projects = await Project.find({
      is_deleted: false,
      is_completed: false,
      $or: [
        { project_requirement: { $in: capitalTokens } },
        { project_requirement: { $in: tokens } },
        { project_requirement: { $elemMatch: { ...capitalTokens } } },
        { project_requirement: { $elemMatch: { ...tokens } } },
        { project_requirement: { $eq: query } },
        { project_domain: { $elemMatch: { ...capitalTokens } } },
        { project_domain: { $elemMatch: { query } } },
        { project_domain: { $in: tokens } },
        { project_leader: { $in: queriedUsers } },
      ],
    })
      .lean(true)
      .limit(20)

    projects.forEach((project) => projectData.push(project))

    for (let i = 0; i < projectData.length; i++) {
      let userData = await UserProfile.findById(
        projectData[i].project_leader
      ).lean(true)
      projectData[i] = {
        fname: userData.fname,
        lname: userData.lname,
        semester: userData.semester,
        title: userData.title,
        ...projectData[i],
      }

      if (userData.thumbnail_pic == undefined) projectData[i].thumbnail_pic = ''
      else projectData[i].thumbnail_pic = userData.thumbnail_pic
    }

    const tmp2Data = []

    const tmp2 = await Project.find({
      is_deleted: false,
      is_completed: false,
      $text: { $search: searchQuery, $caseSensitive: false },
    })
      .lean(true)
      .limit(20)
    // { $text: { $search: searchQuery, $caseSensitive: true } },
    // console.log(tmp2);

    tmp2.forEach((project) => tmp2Data.push(project))

    for (let i = 0; i < tmp2Data.length; i++) {
      let userData = await UserProfile.findById(
        tmp2Data[i].project_leader
      ).lean(true)
      tmp2Data[i] = {
        fname: userData.fname,
        lname: userData.lname,
        semester: userData.semester,
        title: userData.title,
        ...tmp2Data[i],
      }

      if (userData.thumbnail_pic == undefined) tmp2Data[i].thumbnail_pic = ''
      else tmp2Data[i].thumbnail_pic = userData.thumbnail_pic
    }

    const postData = []

    const posts = await Post.find({
      is_deleted: false,
      $or: [
        { owner_id: { $in: queriedUsers } },
        { tags: { $in: tokens } },
        { tags: { $in: capitalTokens } },
        // { $text: { $search: searchQuery, $caseSensitive: true } },
      ],
    })
      .lean(true)
      .limit(20)

    posts.forEach((post) => postData.push(post))
    for (let i = 0; i < postData.length; i++) {
      let userData = await UserProfile.findById(postData[i].owner_id).lean(true)
      postData[i] = {
        fname: userData.fname,
        lname: userData.lname,
        semester: userData.semester,
        title: userData.title,
        ...postData[i],
      }
      if (userData.thumbnail_pic == undefined) postData[i].thumbnail_pic = ''
      else postData[i].thumbnail_pic = userData.thumbnail_pic
    }

    const visited = []

    const tmp3Data = []

    const tmp3 = await Post.find({
      is_deleted: false,
      $text: { $search: searchQuery, $caseSensitive: false },
    })
      .lean(true)
      .limit(20)

    tmp3.forEach((post) => tmp3Data.push(post))

    for (let i = 0; i < tmp3Data.length; i++) {
      let userData = await UserProfile.findById(tmp3Data[i].owner_id).lean(true)
      tmp3Data[i] = {
        fname: userData.fname,
        lname: userData.lname,
        semester: userData.semester,
        title: userData.title,
        ...tmp3Data[i],
      }
      if (userData.thumbnail_pic == undefined) tmp3Data[i].thumbnail_pic = ''
      else tmp3Data[i].thumbnail_pic = userData.thumbnail_pic
    }

    for (let i = 0; i < postData.length; i++) {
      if (visited.indexOf(postData[i]._id.toString()) >= 0) continue
      postData[i].url = `/posts/${postData[i]._id}`
      postData[i].type = 'post'
      searchResult.posts.push(postData[i])
      visited.push(postData[i]._id.toString())
    }

    for (let i = 0; i < tmp3Data.length; i++) {
      if (visited.indexOf(tmp3Data[i]._id.toString()) >= 0) continue
      tmp3Data[i].url = `/posts/${tmp3Data[i]._id}`
      tmp3Data[i].type = 'post'
      searchResult.posts.push(tmp3Data[i])
      visited.push(tmp3Data[i]._id.toString())
    }

    for (let i = 0; i < projectData.length; i++) {
      if (visited.indexOf(projectData[i]._id.toString()) >= 0) continue
      projectData[i].url = `/projects/${projectData[i]._id}`
      projectData[i].type = 'project'
      searchResult.projects.push(projectData[i])
      visited.push(projectData[i]._id.toString())
    }
    for (let i = 0; i < tmp2Data.length; i++) {
      if (visited.indexOf(tmp2Data[i]._id.toString()) >= 0) continue
      tmp2Data[i].url = `/projects/${tmp2Data[i]._id}`
      tmp2Data[i].type = 'project'
      searchResult.projects.push(tmp2Data[i])
      visited.push(tmp2Data[i]._id.toString())
    }

    for (let i = 0; i < users1.length; i++) {
      if (visited.indexOf(users1[i]._id.toString()) >= 0) continue
      users1[i].url = `/connections/${users1[i]._id}`
      users1[i].type = 'user'
      searchResult.users.push(users1[i])
      visited.push(users1[i]._id.toString())
    }
    // console.log(visited);
    for (let i = 0; i < tmp1.length; i++) {
      if (visited.indexOf(tmp1[i]._id.toString()) >= 0) continue
      tmp1[i].url = `/connections/${tmp1[i]._id}`
      tmp1[i].type = 'user'
      searchResult.users.push(tmp1[i])
    }
    // let nam = [];
    // nam.
    visited.splice(0, visited.length)
    // console.log("visited" + visited);
    return res.json(searchResult)
  } catch (e) {
    console.log(e)
    return res.status(500).end()
  }
}

module.exports = { search }
