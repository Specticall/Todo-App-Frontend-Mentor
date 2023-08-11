/* 
TODO 
)
5. Switch themes.
*/

const taskInput = document.querySelector(".todo__input");
const taskContainer = document.querySelector(
  ".block-container"
);
const todoContainer = document.querySelector(
  ".todo-container"
);
const filterBtnContainer =
  document.querySelector(".todo__nav");
const changeThemeBtn =
  document.querySelector(".theme-switch");
const themeLink = document.querySelector(".theme");

class Todo {
  constructor() {
    this.taskList = [];
    this.remaining = 0;
    this.taskCreated = 0;
    this.filter = "all";
  }

  set changeFilterTo(type) {
    this.filter = type;
    console.log(this.filter);
    this.#printTask(this.currentTask);
  }

  set newTask(newTask) {
    this.taskList.push(newTask);
    this.remaining++;
    this.taskCreated++;
    this.#printTask(this.currentTask);
  }

  deleteTask(taskId) {
    this.taskList.splice(
      this.taskList.findIndex((task) => task.id == taskId),
      1
    );
    this.remaining--;
    this.#printTask(this.currentTask);
  }

  findTask(taskId) {
    return this.taskList.find((task) => task.id == taskId);
  }

  get currentTask() {
    if (this.filter === "all") return this.taskList;
    if (this.filter === "active")
      return this.taskList.filter(
        (task) => !task.isComplete
      );
    if (this.filter === "completed")
      return this.taskList.filter(
        (task) => task.isComplete
      );
  }

  clearCompletedTask() {
    this.taskList = this.taskList.reduce(
      (notComplete, task) => {
        !task.isComplete
          ? notComplete.push(task)
          : this.remaining--;
        return notComplete;
      },
      []
    );

    this.#printTask(this.currentTask);
  }

  //prettier-ignore
  #printTask(currentTask) {
    // Reset HTML
    taskContainer.innerHTML = `        
    <ul class="block-container">
      <li class="block__bottom block">
        <div class="block__items-remaining paragraph--gray paragraph--tertiary">
          ${this.remaining} Items Left
        </div>
        <button class="clear-completed button paragraph--tertiary paragraph--gray">
          Clear Completed
        </button>
      </li>
    </ul>
    `;
    // Print
    currentTask
      .map((taskObject) => { return [taskObject.task, taskObject.id,taskObject.isComplete];})
      .forEach(([task, id, isComplete]) => {
      const html = `
        <li class="block list" data-animate=${id} draggable="true">
          <div class="block__list--left" draggable="false">
            <button draggable="false" class="checkmark button ${isComplete ? "checked" : ""}" data-id="${id}">
              <img draggable="false" src="images/icon-check.svg" alt="checkmark"/>
            </button>
            <p draggable="false" class="block__text paragraph--tertiary paragraph--dark-gray" >
            <span draggable="false" >  
            ${task}
            </span>
            </p>
          </div>
          <button draggable="false" class="delete-block button button--icon icon--medium" data-id="${id}">
            <img draggable="false" src="images/icon-cross.svg" alt="Close"/>
          </button>
        </li>
      `;
      taskContainer.insertAdjacentHTML("afterbegin",html);
      });
  }

  restorePreviousSession() {
    if (!localStorage.getItem("taskList")) return;
    const { taskList, remaining, taskCreated, filter } =
      JSON.parse(localStorage.getItem("taskList"));
    this.taskList = taskList;
    this.remaining = remaining;
    this.taskCreated = taskCreated;
    this.filter = filter;
    this.#printTask(this.currentTask);

    this.taskList.forEach((task) => {
      task.__proto__ = Block.prototype;
    });
  }

  swapElement(arr, fromIndex, toIndex) {
    let temp = arr[fromIndex];
    arr[toIndex] = arr[fromIndex];
    arr[fromIndex] = temp;
  }
}

class Block {
  constructor(task, id) {
    this.task = task;
    this.id = id;
    this.isComplete = false;
  }

  toggleComplete() {
    this.isComplete = !this.isComplete;
  }
}

class EventHandlers {
  deleteTask(clicked) {
    Todos.deleteTask(clicked.dataset.id);
  }

  completeTask(clicked) {
    clicked.classList.toggle("checked");
    Todos.findTask(clicked.dataset.id).toggleComplete();
  }

  filterTask(clicked) {
    const type = clicked.dataset.type;

    [...clicked.parentElement.children].forEach((el) => {
      el.classList.remove("selected");
    });

    clicked.classList.add("selected");

    Todos.changeFilterTo = type;
  }

  clearCompletedTask() {
    Todos.clearCompletedTask();
  }

  //prettier-ignore
  getCallback({ action, classSelector }) {
    return function (e) {
      const clickedElement = e.target.closest(
        `.${classSelector}`
      );

      if (!clickedElement ||
          !clickedElement.classList.contains(`${classSelector}`))
          return;
      
      if (action === "deleteTask")
        eventHandler.deleteTask(clickedElement);

      if (action === "completeTask")
        eventHandler.completeTask(clickedElement);

      if (action === "filterTask")
        eventHandler.filterTask(clickedElement);

      if (action === "clearCompletedTask") 
        eventHandler.clearCompletedTask()
      
    };
  }

  dragAndDrop(prevClientY, isDragged) {
    taskContainer.addEventListener(
      "dragstart",
      function (e) {
        const hoverElement = e.target.closest(`.block`);

        if (
          !hoverElement ||
          !hoverElement.classList.contains("block")
        )
          return;

        isDragged = hoverElement;
      }
    );

    taskContainer.addEventListener(
      "dragover",
      function (e) {
        e.preventDefault();
        const hoverElement = e.target.closest(`.list`);

        if (
          !hoverElement ||
          !hoverElement.classList.contains("list") ||
          e.clientY - prevClientY === 0
        )
          return;

        hoverElement.insertAdjacentElement(
          e.clientY - prevClientY > 0
            ? "afterend"
            : "beforebegin",
          isDragged
        );

        prevClientY = e.clientY;
      }
    );
  }
}

let Todos = new Todo();
Todos.restorePreviousSession();
const eventHandler = new EventHandlers();

window.addEventListener("keydown", function (e) {
  if (e.key !== "Enter" || !taskInput.value) return;
  // Create new task object
  Todos.newTask = new Block(
    `${taskInput.value}`,
    Todos.taskCreated
  );
  taskInput.value = "";

  // DEBUG
  console.log(Todos.taskList);
});

taskContainer.addEventListener(
  "click",
  eventHandler.getCallback({
    action: "deleteTask",
    classSelector: "delete-block",
  })
);

taskContainer.addEventListener(
  "click",
  eventHandler.getCallback({
    action: "completeTask",
    classSelector: "checkmark",
  })
);

todoContainer.addEventListener(
  "click",
  eventHandler.getCallback({
    action: "clearCompletedTask",
    classSelector: "clear-completed",
  })
);

filterBtnContainer.addEventListener(
  "click",
  eventHandler.getCallback({
    action: "filterTask",
    classSelector: "todo__nav-btn",
  })
);

eventHandler.dragAndDrop();

// Saves the todo to localStorage object before unloading the page
window.addEventListener("beforeunload", () => {
  localStorage.setItem("taskList", JSON.stringify(Todos));
});

let isDarkmode = false;
changeThemeBtn.addEventListener("click", function (e) {
  const icon = changeThemeBtn.querySelector("img");
  themeLink.setAttribute("href", "css-files/darkmode.css");
  icon.setAttribute("src", "images/icon-sun.svg");

  if (!isDarkmode) {
    themeLink.setAttribute(
      "href",
      "css-files/lightmode.css"
    );
    icon.setAttribute("src", "images/icon-moon.svg");
  }
  // Switch theme
  isDarkmode = !isDarkmode;
});
