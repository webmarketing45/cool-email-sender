# Cool Email sender  
Send html emails from your google account.  

If you have enabled 2 step security in your google account then first create an app specific password for this application. Copy this password to your environment variables or create a alias in your *.bashrc* file.
```
  $ export MAIL_PASSWORD="<Your app specific password>"
```
or just edit the **index.js** file and replace **process.env.MAIL_PASSWORD** with "&lt;your password with quotes&gt;".  

##Customizing html  
Create a html file without any link to external scripts or stylesheets in the ***templates*** folder.
Once satisfied with the html design (try to do as much inline css as possible), go to <a href="http://templates.mailchimp.com/resources/inline-css/">http://templates.mailchimp.com/resources/inline-css/</a> and copy your html in the input box.  
Click convert.  
Copy the converted html to a new file named ***&lt;old-file-name&gt;-converted.html***  

In the index.js file at *line 68*, insert your choices to display in selection and at *line 95*, replace the content of file variable with the filename (without extention) of the html file.  
  
Run using 
```
  $ node index.js
```
