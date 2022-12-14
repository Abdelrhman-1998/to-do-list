import Sortable from "./Sortable.min.js";
enum taskStatus {Active,completed};
interface _Task{
    index:number,
    id:number,
    status:taskStatus,
    value:string
}
class Task{
    static oldIDs:number[]=[];
    static tasks:_Task[]=[];
    static addedTasks:number=0;
    static taskEntry=document.querySelector('.add-task input[type="text"]')! as HTMLInputElement;
    static tasksContainer=document.querySelector("ul .tasks")! as HTMLUListElement;
    static addedItems=document.querySelector('.formDetails .items')! as HTMLSpanElement;
    private taskStatus:taskStatus;
    private index?:number;
    private readonly id?:number;
    private value:string='';
   static validationFlag:boolean;
    constructor(){
        this.taskStatus=taskStatus.Active;
        this.inputValue=Task.taskEntry;
        Task.validationFlag=Task.validateTask(this.value);
        if(Task.validationFlag){
            ++Task.addedTasks;
            this.id=Task.generateNewId();
            this.generateIndex();
        }
    }
    static set taskItems(ele:HTMLSpanElement){
        ele.textContent=Task.addedTasks+"";
    }
    set inputValue(input:HTMLInputElement){
        this.value=input.value;
    }
    set _taskStatus(input:taskStatus){
        this.taskStatus=input;
    }
    get _inputValue(){
        return this.value
    }
    get _id(){
        return this.id
    }
    get _index(){
        return this.index
    }
    get _taskStatus(){
        return this.taskStatus
    }
    static  setTask<T extends _Task>(data:T){
        const newTask=<HTMLTemplateElement>document.querySelector("template.read")!;
        const TemplateContent=newTask.content.cloneNode(true) as HTMLElement;
        const selectedButton=document.querySelector(".task-status button.selected")! as HTMLButtonElement;
        TemplateContent.querySelector('.taskValue')!.textContent=data.value.trim();
        TemplateContent.querySelector('del')!.textContent=data.value.trim();
        (TemplateContent.querySelector('input[type="hidden"]')! as HTMLInputElement).value=""+data.id;
        if(data.status===taskStatus.completed){
            TemplateContent.firstElementChild!.classList.replace('active','completed');
            TemplateContent.querySelector('.taskValue')!.classList.add('d-none');
            TemplateContent.querySelector('del')!.classList.remove('d-none');
            TemplateContent.querySelector('input[type="checkbox"]')!.classList.add("selected");
        }
        taskListener.onRemoveTask(TemplateContent,Task.tasksContainer);
        taskListener.onEditTask(TemplateContent,Task.tasksContainer);
        taskListener.onFinishTask(TemplateContent,Task.tasksContainer);
        TemplateContent.firstElementChild!.classList.add('d-none');
        // ----------------------------
        if(Task.validationFlag ){
            Task.tasksContainer.insertAdjacentElement('beforeend',TemplateContent.firstElementChild!);
            Task.pushNewTask(data);
            console.log(selectedButton)
        }
        return TemplateContent.firstElementChild
        // add listeners
    }
    static createTask(){
        const newTask=new Task();   
        const addedTask= Task.setTask({id:newTask._id!,value:newTask._inputValue,status:newTask._taskStatus,index:newTask._index!});
        newTask.clearTaskEntry();
        Task.updateLocalStorage();
        return addedTask
    }
    static editTask(id:number,value:string,spanElement:HTMLSpanElement,editInput:HTMLInputElement){
        const newValue=editInput.value;
        if(Task.validateTask(newValue)){
            spanElement.textContent=newValue;
            editInput.classList.add("d-none");
            spanElement.classList.remove("d-none");
            Task.tasks.map((ele)=>{
                if(ele.id===id){
                  ele.value=value;
                }
              })
        }
        console.log(Task.tasks)
        Task.updateLocalStorage();
    }
    static deleteTask(id:number){
        Task.tasks=Task.tasks.filter((ele)=>{
            return ele.id!=id;
        })
        Task.oldIDs.splice(Task.oldIDs.indexOf(id),1);
        Task.ResetIndex();
        Task.updateLocalStorage();
    }
    static updateCheckBox(input:boolean){
        const checkBox=<HTMLInputElement>document.querySelector(".add-task input[type='checkbox']")!;
        if(input){
            checkBox.classList.add('selected');
        }
        else{
            checkBox.classList.remove('selected');
        }
    }   
     static  pushNewTask<T extends _Task>(data:T){
        const newTask=data;
        Task.tasks.push(newTask);
        console.log(Task.tasks)
    }
    clearTaskEntry(){
        Task.taskEntry.value="";
        Task.validationFlag=false;
    }
    static clearCompletedTasks(){
        Task.tasks=Task.tasks.filter((ele)=>{
            return ele.status===taskStatus.Active
        })
        Task.ResetIndex();
        Task.addedTasks=Task.tasks.length;
      
    }
    static finishTask(id:number,checkBox:HTMLInputElement){

       Task.tasks.map((ele)=>{
            if(ele.id===id){
                console.log(id)
                if(checkBox.classList.toString().includes('selected')){
                    ele.status=taskStatus.completed;
                }
                else{
                    ele.status=taskStatus.Active;
                }
            }
        })
        Task.updateLocalStorage();
    }
    static  validateTask(value:string){
       // check if is nullable or not 
     
        if(!value || !value.trim().length){
           Task.validationFlag=false
            return  Task.validationFlag
        }
        else{
            Task.validationFlag=true;
        }
        return Task.validationFlag
       // ----------------------
    
    }
    static renderTasks(){
        const selectedButton=document.querySelector(".task-status button.selected")! as HTMLButtonElement;
        const selectedButtonText=selectedButton.innerText.trim().toLowerCase();
        const formDetails=document.querySelector(".formDetails")!;
        switch (selectedButtonText) {
            case "all":
              Task.tasksContainer.querySelectorAll("li").forEach((ele)=>{
                    ele.classList.remove('d-none');
              })
              Task.addedItems.textContent=Task.addedTasks+"";
              break;
            case "completed":
                Task.tasksContainer.querySelectorAll("li").forEach((ele)=>{
                    if(ele.classList.toString().includes('active')){
                        ele.classList.add('d-none');
                    }
                    else{
                        
                        ele.classList.remove('d-none');
                    }

                })
                Task.addedItems.textContent=Task.tasksContainer.querySelectorAll("li.completed")!.length+"";
                break;
            case "active":
                Task.tasksContainer.querySelectorAll("li").forEach((ele)=>{
                    if(ele.classList.toString().includes('completed')){
                        ele.classList.add('d-none');
                    }
                    else{
                        ele.classList.remove('d-none');
                    }

                })
                Task.addedItems.textContent=Task.tasksContainer.querySelectorAll("li.active")!.length+"";
                break;
            default:
               
                break;
        }
        const shownElement=Task.tasksContainer.querySelectorAll("li")!.length-Task.tasksContainer.querySelectorAll("li.d-none")!.length;
        shownElement?formDetails.classList.remove('changeBorderRaduis'):formDetails.classList.add('changeBorderRaduis')
    }
    static updateLocalStorage(){
        localStorage.tasks=JSON.stringify(Task.tasks);
    }
    static getLocalStorage(){
        let tasks:_Task[]=[];
        if(localStorage.tasks){
            tasks=JSON.parse(localStorage.tasks)
        }
        localStorage.tasks=JSON.stringify(tasks);
        Task.tasks=tasks;
        Task.addedTasks=tasks.length;
        tasks.forEach((ele)=>{
            const addedTask=Task.setTask(ele)!;
            Task.tasksContainer.insertAdjacentElement('beforeend',addedTask);
        })
     
        Task.renderTasks();
    }
    static generateNewId(){
        let newId= Math.ceil(Math.random()*10000);
        while(true){
            if(Task.oldIDs.includes(newId)){
                newId=Math.ceil(Math.random()*10000);

            }
            else{
                Task.oldIDs.push(newId);
                break;
            } 
     
        }
        return newId
    }
     generateIndex(){
        this.index=Task.tasksContainer.querySelectorAll("li")!.length;
    }
static ResetIndex(){
        
        Task.tasks.map((ele,index)=>{
            ele.index=index;
        })
    }
}
class TaskListeners{
    // singleTone class (called for one time only)
    static instance:TaskListeners;
    static taskEntry=document.querySelector('.add-task input[type="text"]')! as HTMLInputElement;
    private constructor (){
        // call all listeners
      
        this.onClickBtn();
        this.onSubmitForm();
        this.onToggleMode();
        this.onAddTask();
        this.onTypingTask();
        
    }
    static newInstance():TaskListeners{
        if(!TaskListeners.instance){
            TaskListeners.instance=new TaskListeners();
        }
        return TaskListeners.instance;
    }
    onSubmitForm(){
        const form=document.querySelector('form')!;
        form.addEventListener("submit",(e:Event)=>{
            e.preventDefault();
        })
    }
    onToggleMode(){
        const modeSw=document.querySelector('h1 i')!;
        const styleFile=document.querySelector('link.mode')!;
        modeSw.addEventListener("click",(e)=>{
            if(modeSw.classList.toString().includes("moon")){
                styleFile.setAttribute("href","./styles/darkMode.css");
                modeSw.classList.replace("moon","sun");
            }
            else if(modeSw.classList.toString().includes("sun")){
                styleFile.setAttribute("href","./styles/lightMode.css");
                modeSw.classList.replace("sun","moon");
            }
        })
    }
    onClickBtn(){
        const buttons=document.querySelectorAll(".task-status button")!;
        const clearCompleted=document.querySelector(".formDetails > button:last-child")! as HTMLButtonElement;
        clearCompleted.addEventListener("click",()=>{
            this.onClearCompleted();
            if(!clearCompleted.classList.toString().includes("selected")){
                clearCompleted.classList.add("selected");  
            }
            setTimeout(()=>{
                clearCompleted.classList.remove("selected");
            },500)
        })
        buttons.forEach((ele,btnindex)=>{
            ele.addEventListener("click",()=>{
                if(!ele.classList.toString().includes("selected")){
                    ele.classList.add('selected');
                    buttons.forEach((val,index)=>{
                        if(btnindex!==index){
                            val.classList.remove('selected');
                        }
                    })
                }
                Task.renderTasks();
            })
        })
    }
    onAddTask(){
        const addBtn=document.querySelector('.add-task input[type="checkbox"]')! as HTMLInputElement;
        addBtn.addEventListener("click",()=>{
          Task.createTask();
          Task.updateCheckBox(Task.validationFlag);
          Task.renderTasks();
        })
        Task.taskEntry.addEventListener("keypress",(e)=>{ 
            if(e.key==="Enter"){
                e.preventDefault();
                Task.createTask();
                Task.updateCheckBox(Task.validationFlag);
                Task.renderTasks();
            }
        })
    }
    onTypingTask(){ 
       TaskListeners.taskEntry.addEventListener("input",(e)=>{
            Task.validateTask(TaskListeners.taskEntry.value);
            Task.updateCheckBox(Task.validationFlag);
       }) 
    }
    onRemoveTask(childEle:HTMLElement,parentEle:HTMLUListElement){
        const deleteIcon=childEle.querySelector(".fa-xmark")!;
        const childTask=deleteIcon.parentElement!.parentElement!;
        const listHiddenInput=childTask.querySelector("input[type='hidden']")! as HTMLInputElement;
        deleteIcon.addEventListener("click",()=>{
            Task.deleteTask(+listHiddenInput.value);
            Task.addedTasks=--Task.addedTasks;
            parentEle.removeChild(childTask);
            Task.renderTasks();
        })
    }
    onEditTask(childEle:HTMLElement,parentEle:HTMLUListElement){
     
        const editIcon=childEle.querySelector(".fa-pencil")!;
        const childTask=editIcon.parentElement!.parentElement!;
        const checkbox=childEle.querySelector("input[type='checkbox']")! as HTMLInputElement;
        const spanElement=childTask.querySelector(".taskValue")! as HTMLSpanElement;
        const editInput=childTask.querySelector(".edit")! as HTMLInputElement;
        const delTag=childTask.querySelector(".completed")!;
        const listHiddenInput=childTask.querySelector("input[type='hidden']")! as HTMLInputElement;

        editInput.addEventListener("focus",()=>{
            checkbox.classList.remove('selected');
            childTask.classList.replace('completed','active');
            Task.finishTask(+listHiddenInput.value,checkbox);
            checkbox.classList.add('stopPointer');
        })
        editInput.addEventListener("input",()=>{

            if(!Task.validateTask(editInput.value)){
                editInput.placeholder="value can't be null";
                editIcon.classList.add('stopPointer');
               
                document.querySelector(".add-task input[type='checkbox']")!.classList.add("stopPointer");
                editInput.focus();
                checkbox.classList.add('stopPointer');
                document.querySelectorAll("button")!.forEach((ele)=>{
                    ele.classList.add('stopPointer');
                    
                })
            }
            else{
                checkbox.classList.remove('stopPointer');
                editIcon.classList.remove('stopPointer');
                document.querySelector(".add-task input[type='checkbox']")!.classList.remove("stopPointer");
                document.querySelectorAll("button")!.forEach((ele)=>{
                    ele.classList.remove('stopPointer');
                })
            }
        })
        editIcon.addEventListener("click",()=>{
            childTask.classList.add('edit');
            const oldValue=spanElement.textContent!;
            editInput.value=oldValue;
            editInput.classList.remove('d-none');
            delTag.classList.remove('d-none');
            spanElement.classList.remove('d-none');
            spanElement.classList.add('d-none');
            delTag.classList.add('d-none');
            editInput.classList.remove('d-none');
            editInput.focus();
        // store old name  
        })
        editInput.addEventListener("focusout",()=>{
            childTask.classList.remove('edit');
            checkbox.classList.remove('stopPointer');
            const selectedButton=document.querySelector('.task-status button.selected')! as HTMLButtonElement;
            if(Task.validateTask(editInput.value)){
                document.querySelectorAll("button")!.forEach((ele)=>{
                    ele.classList.remove('stopPointer');
                })
          
                Task.editTask(+listHiddenInput.value,editInput.value,spanElement,editInput);
                if(selectedButton.innerText.toLowerCase()==='completed'){

                        setTimeout(() => {
                            childTask.classList.add('d-none');
                            Task.addedItems.textContent=document.querySelectorAll('.addedTasks.completed').length+"";
                            const formDetails=document.querySelector(".formDetails")!;
                            const shownElement=Task.tasksContainer.querySelectorAll("li")!.length-Task.tasksContainer.querySelectorAll("li.d-none")!.length;
                            shownElement?formDetails.classList.remove('changeBorderRaduis'):formDetails.classList.add('changeBorderRaduis')
                        },500);
                
           
                }
            }
            else{
                editInput.focus();
            }
       
        })
        editInput.addEventListener("keypress",(e)=>{
            childTask.classList.remove('edit');
            checkbox.classList.remove('stopPointer');
            const selectedButton=document.querySelector('.task-status button.selected')! as HTMLButtonElement;
            document.querySelector("form")!.classList.remove('stopPointerEvents');
            if(e.key==="Enter"){
                e.preventDefault();
                Task.editTask(+listHiddenInput.value,editInput.value,spanElement,editInput);
                if(selectedButton.innerText.toLowerCase()==='completed'){
                    if(Task.validateTask(editInput.value)){
                        setTimeout(() => {
                            childTask.classList.add('d-none');
                            Task.addedItems.textContent=document.querySelectorAll('.addedTasks.completed').length+"";
                            const formDetails=document.querySelector(".formDetails")!;
                            const shownElement=Task.tasksContainer.querySelectorAll("li")!.length-Task.tasksContainer.querySelectorAll("li.d-none")!.length;
                            shownElement?formDetails.classList.remove('changeBorderRaduis'):formDetails.classList.add('changeBorderRaduis')
                        },);
    
                    }else{
                        editInput.focus();
                    }
                    
                }
            }
            const formDetails=document.querySelector(".formDetails")!;
            const shownElement=Task.tasksContainer.querySelectorAll("li")!.length-Task.tasksContainer.querySelectorAll("li.d-none")!.length;
            shownElement?formDetails.classList.remove('changeBorderRaduis'):formDetails.classList.add('changeBorderRaduis')
        })
     
    }
    onFinishTask(childEle:HTMLElement,parentEle:HTMLUListElement){
        const checkbox=childEle.querySelector("input[type='checkbox']")! as HTMLInputElement;
        const childTask=checkbox.parentElement!;
        const spanElement=childTask.querySelector(".taskValue")! as HTMLSpanElement;
        const editInput=childTask.querySelector(".edit")! as HTMLInputElement;
        const delTag=childTask.querySelector(".completed")!;
        const listHiddenInput=childTask.querySelector("input[type='hidden']")! as HTMLInputElement;
        checkbox.addEventListener("click",()=>{
            const selectedButton=document.querySelector('.task-status button.selected')! as HTMLButtonElement;
            if(!checkbox.classList.toString().includes('selected')){
                checkbox.classList.add('selected');
                delTag.textContent=spanElement.textContent;
                editInput.classList.remove('d-none');
                delTag.classList.remove('d-none');
                spanElement.classList.remove('d-none');
                editInput.classList.add('d-none');
                spanElement.classList.add('d-none');
                delTag.classList.remove('d-none');
                childTask.classList.replace('active','completed');
                if(selectedButton.innerText.toLowerCase()==='active'){
                    setTimeout(() => {
                        childTask.classList.add('d-none');
                        Task.addedItems.textContent=document.querySelectorAll('.addedTasks.active').length+"";
                        const formDetails=document.querySelector(".formDetails")!;
                        const shownElement=Task.tasksContainer.querySelectorAll("li")!.length-Task.tasksContainer.querySelectorAll("li.d-none")!.length;
                        shownElement?formDetails.classList.remove('changeBorderRaduis'):formDetails.classList.add('changeBorderRaduis')
                    }, 500);
           
                }
            }
            else{
                checkbox.classList.remove('selected');
                delTag.classList.add("d-none");
                spanElement.classList.remove('d-none');
                childTask.classList.replace('completed','active');
                if(selectedButton.innerText.toLowerCase()==='completed'){
                    setTimeout(() => {
                        childTask.classList.add('d-none');
                        Task.addedItems.textContent=document.querySelectorAll('.addedTasks.completed').length+"";
                    }, 500);
                }
            }
            Task.finishTask(+listHiddenInput.value,checkbox);
            console.log(Task.tasks)
        })
    }
    onClearCompleted(){
        const selectedButton=document.querySelector(".formDetails > button:last-child")! as HTMLButtonElement;
        const selectedButtonText=selectedButton.innerText.toLowerCase().trim();
        const completedElements=Task.tasksContainer.querySelectorAll("li.completed")!;
        console.log(selectedButtonText);
        Task.clearCompletedTasks();
        completedElements.forEach((ele)=>{
            Task.tasksContainer.removeChild(ele);
        })
        Task.renderTasks();
        Task.updateLocalStorage();
    }

}
let newElement:_Task;
let oldElement:_Task;
const taskListener=TaskListeners.newInstance();
Task.getLocalStorage();
new Sortable(document.querySelector(".tasks"), {
    animation: 350,
    chosenClass: "sortable-chosen",
    dragClass: 'sortable-drag',
    ghostClass: 'sortable-ghost',
    fallbackClass: 'sortable-fallback',
    onStart:function (/**Event*/ evt:any){
        console.log("old")
        oldElement=Task.tasks[evt.oldIndex];
    },
    onEnd: function (/**Event*/ evt:any) {
        // filter
        const newIds:number[]=[];
        console.log("sdds")
        const oldTasks=[...Task.tasks];
    
        let newTasks:_Task[]=[];
        Task.tasksContainer.querySelectorAll("li")!.forEach((ele)=>{
         const inputElement=ele.querySelector("input[type='hidden']")as HTMLInputElement;
         const id=+inputElement.value;
            newIds.push(id);
        })
        for(let i=0;i<Task.tasks.length;i++){
                let id=newIds[i];
                for (let j=0;j<Task.tasks.length;j++){
                   let taskId=Task.tasks[j].id;
                        if(taskId===id){
                            Task.tasks[j].index=newTasks.length;
                            newTasks.push(Task.tasks[j]);
                            break;
                        }
                }
        }
        Task.tasks=newTasks;
        Task.updateLocalStorage();
        // console.log(evt.oldIndex)
     
    }
});
