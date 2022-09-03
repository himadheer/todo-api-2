const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
var isValid = require('date-fns/isValid')
var format = require('date-fns/format')

const app = express();
app.use(express.json());

let database = null;

const dbPath = path.join(__dirname, "todoApplication.db");

const intialiseDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running with http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db error : ${e.message}`);
    process.exit(1);
  }
};

intialiseDbAndServer();


const possiblePriorities = ["HIGH", "MEDIUM", "LOW"]

const possibleStatus = ["TO DO", "IN PROGRESS", "DONE"]

const possibleCategories = ["WORK", "HOME", "LEARNING"]


const convert = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
    category: obj.category,
    dueDate: obj.due_date,
  };
};


app.get("/todos/", async (request, response) => {

  const { priority, status, search_q, category } = request.query;

  let q;
  let array;

  if (
    priority != undefined &&
    status === undefined &&
    search_q === undefined &&
    category === undefined
  ) {

     if(possiblePriorities.includes(priority) === true){
          
          q = `
            SELECT
                *
            FROM
                todo
            WHERE
                priority LIKE '${priority}'      
                          
                ;`;

    array = await database.all(q);
    response.send(
    array.map((obj) => {
      return convert(obj);
    })
  );
    } 

    else{
         
        response.status(400)
        response.send("Invalid Todo Priority")
    }

}
  


 
 else if (
    priority === undefined &&
    status !== undefined &&
    search_q === undefined &&
    category === undefined 
  ) {

      if (possibleStatus.includes(status) === true) {
            
              q = `
              SELECT
                *
               FROM
                todo
               WHERE
                status LIKE '${status}'                
                ;`; 

    array = await database.all(q);
    response.send(
    array.map((obj) => {
      return convert(obj);
    })
  );
  
    }

   else{
         
        response.status(400)
        response.send("Invalid Todo Status") 
   }
          
  }
 
  
  
  
 else if (
    priority === undefined &&
    status === undefined &&
    search_q != undefined &&
    category === undefined
  ) {
    q = `
              SELECT
                *
               FROM
                todo
               WHERE
                todo LIKE '%${search_q}%'                
                ;`;
    array = await database.all(q);
    response.send(
    array.map((obj) => {
      return convert(obj);
    })
  );

  }

 else if (
    priority === undefined &&
    status === undefined &&
    search_q === undefined &&
    category != undefined
  ) { 

      if (possibleCategories.includes(category) === true) {
           
           q = `
              SELECT
                *
               FROM
                todo
               WHERE
                category LIKE '${category}'                
                ;`;   
    array = await database.all(q);
    response.send(
    array.map((obj) => {
      return convert(obj);
    })
  );
      
                
   } 

  else{
         
        response.status(400)
        response.send("Invalid Todo Category") 
    }

   }
  
 else if (
    priority != undefined &&
    status != undefined &&
    search_q === undefined &&
    category === undefined
  ) {

      if(possiblePriorities.includes(priority) === true && possibleStatus.includes(status) === true) {
         
          q = `
              SELECT
                *
               FROM
                todo
               WHERE
               
                priority LIKE '${priority}' AND

                status LIKE '${status}'                              
                  ;`;
    array = await database.all(q);
    response.send(
    array.map((obj) => {
      return convert(obj);
    })
  );
 

      }
       
      else if (possiblePriorities.includes(priority) === false){
        
         response.status(400)
         response.send("Invalid Todo Priority")
         
      }

      else {
        
         response.status(400)
         response.send("Invalid Todo Status") 

      }

  } 




  else if (
    priority === undefined &&
    status != undefined &&
    search_q === undefined &&
    category != undefined
  ) {

     if(possibleStatus.includes(status) === true && possibleCategories.includes(category) === true){
            
          q = `
              SELECT
                *
               FROM
                todo
               WHERE

               category LIKE '${category}' AND

                status LIKE '${status}'                              
                  ;`;

    array = await database.all(q);
    response.send(
    array.map((obj) => {
      return convert(obj);
    })
  );
             
    } 

    else if(possibleStatus.includes(status) === false){
            
         response.status(400)
         response.send("Invalid Todo Status") 
    }

    else {
        response.status(400)
        response.send("Invalid Todo Category") 
    }
 
}
   
  
  else if (
    priority != undefined &&
    status === undefined &&
    search_q === undefined &&
    category != undefined
  ) {

    if(possiblePriorities.includes(priority) === true && possibleCategories.includes(category) === true){
        
    q = `
              SELECT
                *
               FROM
                todo
               WHERE

                priority LIKE '${priority}' AND

                category LIKE '${category}'
                  ;`;
    array = await database.all(q);
    response.send(
    array.map((obj) => {
      return convert(obj);
    })
  );


    }

     else if (possiblePriorities.includes(priority) === false){
        
         response.status(400)
         response.send("Invalid Todo Priority")
         
      }

      else {

        response.status(400)
        response.send("Invalid Todo Category") 
      }

  }

    
   
});   

/*
API 2
Path: /todos/:todoId/
Method: GET
Description: Returns a specific todo based on the todo ID  */

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const Q = `
              SELECT
                *
               FROM
                Todo
               WHERE
                id = ${todoId}
                ;`;
  const array = await database.get(Q);
  response.send(convert(array));
});

/*

API 3
Path: /agenda/
Method: GET
Description:
Returns a list of all todos with a specific due date in the query parameter /agenda/?date=2021-12-12
*/

app.get("/agenda/", async (request, response) => {
    
  const {date} = request.query;

  var result = isValid(new Date(date))

  
 if (result === true){
   
      const formattedDate = format(new Date(date), "yyyy-MM-dd")
      console.log(formattedDate)
      const Q = `
              SELECT
                *
               FROM
                todo
               WHERE
                due_date = '${formattedDate}'
                `;
  const array = await database.all(Q);
 
  response.send(array.map((obj)=>{
      return convert(obj)
  }));
  ;      
        
 }
else{
      response.status(400)
      response.send("Invalid Due Date")       
}  

});

/*
### API 4

#### Path: `/todos/`

#### Method: `POST`

#### Description:

Create a todo in the todo table,

*/

app.post("/todos/", async (request, response) => {
    
  const { id, todo, priority, status , category , dueDate } = request.body;


  if (possiblePriorities.includes(priority) === false) {
       
      response.status(400)
      response.send("Invalid Todo Priority") 
  }

  else if(possibleStatus.includes(status) === false){

      response.status(400)
      response.send("Invalid Todo Status") 
  }

  else if(possibleCategories.includes(category) === false){

      response.status(400)
      response.send("Invalid Todo Category") 
  }

  else {

         
  var result = isValid(new Date(dueDate)) 
  
  if(result === true){

  const formattedDate = format(new Date(dueDate), "yyyy-MM-dd")
  
  const Q = `
              INSERT INTO todo
              (id,todo, priority, status,category, due_date )
              VALUES(${id},'${todo}','${priority}','${status}', '${category}', '${formattedDate}')`;

  await database.run(Q);
  response.send("Todo Successfully Added");
  
  }
 else{
      response.status(400)
      response.send("Invalid Due Date")       
}  

  }
  
});
  


   


/*

API 5
Path: /todos/:todoId/
Method: PUT
Description:
Updates the details of a specific todo based on the todo ID

*/

app.put("/todos/:todoId/", async (request, response) => {

  const { todo = "", priority = "" , status = "" , category = "", dueDate = ""} = request.body;

  const { todoId } = request.params;

  if (todo != "") {
    const Q = `
              UPDATE todo
              
              SET 
                 todo = '${todo}'
        
              WHERE
                 id = ${todoId}`;

    await database.run(Q);

    response.send("Todo Updated");
  } 

  else if (priority != "") {

    if(possiblePriorities.includes(priority) === true){
     
          const Q = `
              UPDATE todo
              
              SET 
                
                 priority = '${priority}'                 
              
              WHERE
                 id = ${todoId}`;

    await database.run(Q);
    response.send("Priority Updated");
         
    }
   
  else{
         
        response.status(400)
        response.send("Invalid Todo Priority")
    }


  }

  else if (status != "") {

    if(possibleStatus.includes(status) === true){
         
         const Q = `
              UPDATE todo
              
              SET 
                 status = '${status}'
              WHERE
                 id = ${todoId}`;
   
    await database.run(Q);
    response.send("Status Updated");

    }

    else{

         response.status(400)
         response.send("Invalid Todo Status") 
    }
   
  }

  else if (category != "") {

    if(possibleCategories.includes(category) === true){

         const Q = `
              UPDATE todo
              
              SET 
                 category = '${category}'
              WHERE
                 id = ${todoId}`;

    await database.run(Q);
    response.send("Category Updated");
    }

    else{
       response.status(400)
       response.send("Invalid Todo Category") 
    }
  
  }

  else if (dueDate != "") {

    var result = isValid(new Date(dueDate)) 

    if(result === true){

    const formattedDate = format(new Date(dueDate), "yyyy-MM-dd")    

    const Q = `
              UPDATE todo
              
              SET 
                 due_date = '${formattedDate}'
              WHERE
                 id = ${todoId}`;

    await database.run(Q);
    response.send("Due Date Updated");

    }

    else{

      response.status(400)
      response.send("Invalid Due Date") 
    }

  }
  
});



/*
API 6
Path: /todos/:todoId/
Method: DELETE
Description:
Deletes a todo from the todo table based on the todo ID
*/

app.delete("/todos/:todoId/", async (request, response) => {


  const { todoId } = request.params;


    const Q = `
              DELETE FROM
                
                todo
        
              WHERE
                 id = ${todoId}`;

    await database.run(Q);

    response.send("Todo Deleted");
})

module.exports = app;
