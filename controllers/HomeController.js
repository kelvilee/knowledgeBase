let db = require("../models/Home");




async function latestPosts(req, res) {
    var data = await db.getLatestPosts();
    var pdata = await db.loadProfile(req.session.userEmail);
    //checks to make sure we have posts
    console.log(req.session.userEmail)
    console.log(pdata[0])
    if(req.session.SID === undefined) {
        res.redirect('/');
    }
    else if (data.length == 0) {
        res.render('home');
    }
    //renders posts with next button if their are more than 5 posts
    else if (data.length > 5) {
        data.pop();
        res.render('home', {
            'post': data,
            "prev": data[data.length - 1].postid,
            "next": data[data.length - 1].postid,
            "pdata": pdata[0],
            "prevhidden": "none",
            "nexthidden": "block"
        });
    }
    //renders data without next button if there are 5 or less posts
    else {
        res.render('home', {
            'post': data,
            "prev": data[data.length - 1].postid,
            "next": data[data.length - 1].postid,
            "pdata": pdata[0],
            "prevhidden": "none",
            "nexthidden": "none"
        });
    }
}


async function latestPostsNext(req, res) {
    var data = await db.getLatestPostsNext(req.query.next);
    var pdata = await db.loadProfile(req.session.userEmail);
    var bottomid = await db.getBottomPostId();

    if (data[data.length - 1].postid == bottomid[0].postid) {
        res.render('home', {
            'post': data,
            "next": data[data.length - 1].postid,
            "prev": req.query.next,
            "pdata": pdata[0],
            "nexthidden": "none"
        });
    }
    else {
        res.render('home', {
            'post': data,
            "next": data[data.length - 1].postid,
            "prev": req.query.next,
            "pdata": pdata[0],
            "nexthidden": "block"
        });
    }

}

async function latestPostsPrev(req, res) {

    var data = await db.getLatestPostsPrevious(req.query.prev);
    var pdata = await db.loadProfile(req.session.userEmail);
    var topid = await db.getMostRecentPostId();
    var previd = data[data.length - 1].postid

    if (previd == topid[0].postid) {
        res.redirect("/home")
    }
    else {
        data.pop();
        data = data.reverse()
        res.render('home', {
            'post': data,
            "next": data[data.length - 1].postid,
            "prev": previd,
            "pdata": pdata[0],
            "prevhidden": "block",
            "nexthidden": "block"
        });
    }

}

async function newPost(req, res) {
    await db.insertPost(req.session.userEmail, req.body.title, req.body.explanation, req.body.topic);

    res.redirect("/home");
}



async function search(req, res) {
    var data = await db.searchPosts(req.query.search);
    console.log(data);
    res.render("posts", { "post": data });
}



async function filterPosts(req, res) {
    var data = await db.getFilteredPosts(req.query.topic)
    res.render("posts", { "post": data })
}


function logout(req, res) {
    req.session.destroy();
    res.redirect('/');
}


// async function getMyProfile(req, res) {
//     var profiledata = await db.getProfile(req.session.userEmail);
//     console.log(profiledata[0])
//     var postdata = await db.getUserPosts(profiledata[0].userprofileid);
//     res.render("homeProfile", { "post": postdata, "pdata": profiledata[0] })

// }


async function getProfile(req, res) {
    var profiledata = await db.getProfile(req.query.profileid);
    var postdata = await db.getUserPosts(profiledata[0].userprofileid);
    if (profiledata[0].email ==req.session.userEmail) {
        res.render("homeProfile", { "post": postdata, "pdata": profiledata[0] })
    }
    else {
        res.send("other profile")
    }
    

}










module.exports = {
    latestPosts: latestPosts,
    latestPostsNext: latestPostsNext,
    latestPostsPrev: latestPostsPrev,
    newPost: newPost,
    search: search,
    filterPosts: filterPosts,
    logout: logout,
    getProfile: getProfile
}