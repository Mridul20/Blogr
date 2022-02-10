const editor = new EditorJS({
    tools: {
        header: Header,
        raw: RawTool,
        image: SimpleImage, 
        // linkTool: {
        //     class: LinkTool,
        //     config: {
        //       endpoint: 'http://localhost:3000/fetchUrl', // Your backend endpoint for url data fetching,
        //     }
        //   },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          embed: Embed,
          quote: Quote,
    }
  });